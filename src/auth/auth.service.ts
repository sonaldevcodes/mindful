import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { FirebaseAdminService } from '../common/firebase/firebase-admin';
import { AuthResponseDto, LoginAuthDto } from './dto/login-auth.dto';
import { UserService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UpdateUserDto } from '../users/dto/update-user.dto';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { EnrichedQuestion, UserEntity } from '../users/infrastructure/persistence/relational/entities/user.entity';
import { In, Repository } from 'typeorm';
import { SendOtpDto } from '../users/dto/send-otp.dto';
import { VerifyOtpDto } from '../users/dto/verify-otp.dto';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import Telnyx from 'telnyx';
import { Twilio } from 'twilio';
import { messaging } from 'firebase-admin';
import { TelnyxLogService } from '../telnyx-log/telnyx-log.service';
import { CreateTelnyxLogDto } from '../telnyx-log/dto/create-telnyx-log.dto';
import { Question } from '../questionnaire/questions/question.entity';
import { ActivityEntity } from '../activities/entities/activity.entity';
import { Questionnaire } from '../questionnaire/entities/questionnaire.entity';

@Injectable()
export class AuthService {
  private twilioClient: Twilio;
  private telnyxClient;
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly telnyxLogService: TelnyxLogService,
    private readonly firebaseAdminService: FirebaseAdminService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,

    @InjectRepository(Question)
    private readonly question: Repository<Question>,

    @InjectRepository(Questionnaire)
    private readonly activityRepository: Repository<ActivityEntity>,
  ) {
    // this.initializeTelnyxClient();
  }

  // Initialize Telnyx Client asynchronously
  async initializeTelnyxClient() {
    try {
      // Dynamically import the Telnyx SDK
      const telnyx = await import('telnyx');
      this.telnyxClient = new telnyx.Telnyx(
        process.env.TELNYX_API_KEY as string,
      );
      return this.telnyxClient;
    } catch (error) {
      console.log('Error loading Telnyx SDK:', error);
    }
  }

  async registerUser(
    firebaseToken: string,
    createUserDto: CreateUserDto,
  ): Promise<AuthResponseDto> {
    const { role, mobileNumber, countryCode } = createUserDto;
    const finalNumber = countryCode + mobileNumber;

    if (role !== 'admin') {
      if (!firebaseToken) {
        throw new BadRequestException(
          'Firebase token is required for normal users',
        );
      }

      const decodedToken = await this.firebaseAdminService.verifyToken(firebaseToken);
      const firebaseMobileNumber = decodedToken.phone_number;

      if (firebaseMobileNumber !== finalNumber) {
        throw new UnauthorizedException(
          'Mobile number does not match Firebase record',
        );
      }
    }

    // Create the user (for both admin and normal users)
    const user = await this.userService.createUser(firebaseToken, createUserDto);

    const jwtToken = this.jwtService.sign({ id: user.id, role: user.role });

    return {
      jwtToken,
      user: user as UserEntity, // optional if TS complains about the type
    };
  }


  async login(
    firebaseToken: string,
    loginAuthDto: LoginAuthDto,
  ): Promise<AuthResponseDto> {
    const { mobileNumber, countryCode } = loginAuthDto;
    const finalNumber = countryCode.concat(mobileNumber);
    if (!firebaseToken) {
      throw new BadRequestException('Firebase token is required');
    }

    const decodedToken =
      await this.firebaseAdminService.verifyToken(firebaseToken);
    const firebaseMobileNumber = decodedToken.phone_number;

    if (firebaseMobileNumber !== finalNumber) {
      throw new UnauthorizedException(
        'Mobile number does not match Firebase record',
      );
    }

    let user = await this.userService.findByMobileNumber(mobileNumber);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Generate JWT token
    const jwtToken = this.jwtService.sign({ id: user?.id, role: user?.role });

    // Update user entity with the fcmToken and jwtToken
    // const newUser = new UpdateUserDto()
    // newUser.fcmToken = loginAuthDto.fcmToken;
    // newUser.token = jwtToken;
    // newUser.firebaseToken = firebaseToken
    return await this.userService.updateUser(
      loginAuthDto as any,
      user.id,
      jwtToken,
    );
  }

  async updateUser(
    userId: number,
    updateUserDto: UpdateUserDto,
    jwtToken: string,
  ): Promise<AuthResponseDto> {
    //  please uncomment below code if you need to mobileNumber authnicate with firebase on update

    // const { mobileNumber, countryCode } = updateUserDto;
    // const finalNumber = String(countryCode).concat(String(mobileNumber));
    // const decodedToken = await this.firebaseAdminService.verifyToken(firebaseToken);
    // const mobileNumberFromToken = decodedToken.phone_number;

    // if (!mobileNumberFromToken) {
    //   throw new UnauthorizedException('Mobile number not found in the token.');
    // }

    // if (finalNumber !== mobileNumberFromToken) {
    //   throw new UnauthorizedException('The provided mobile number does not match the verified Firebase token.');
    // }

    return await this.userService.updateUser(updateUserDto, userId, jwtToken);
  }

  async findUserById(userId: number) {
    return await this.userService.getUserById(userId);
  }

  async checkAdmin(userId: number) {
    const user = await this.userService.getUserById(userId);
    if (user?.user?.role !== 'admin') {
      throw new UnauthorizedException('Only admins can access this route');
    }
    return true;
  }

  async sendOTP(sendOTPDto: SendOtpDto): Promise<{ message: string }> {
    const { mobileNumber, countryCode, isoCode, isSignUp } = sendOTPDto;
    
    const finalNumber = countryCode.concat(mobileNumber);
    
    const otp = this.generateOTP();
    const otpExpiryTime = this.getOTPExpiryTime();
    
    const validStatuses = [
      'queued',
      'sending',
      'sent',
      'delivered',
      'delivery_unconfirmed',
    ];
    
    const errorResponse = {
      statusCode: 401,
      message: 'OTP could not be sent at the moment. Please try again later',
    };

    try {
      // Find or create user
      let user = await this.userRepository.findOne({
        where: { mobileNumber, isDeleted: false },
      });
      
      // If it's a signup and user already exists, throw message
      if (isSignUp && user) {
        return {
          message:'Mobile number is already registered.'
        }
      }

      if (!user) {
        user = this.userRepository.create({
          mobileNumber,
          countryCode,
          isoCode,
          otp,
          otpExpiryTime,
        });
      } else {
        user.otp = otp;
        user.otpExpiryTime = otpExpiryTime;
      }

      await this.userRepository.save(user);

      // Import axios
      const axios = (await import('axios')).default;

      // Log the request payload for debugging
      const requestPayload = {
        from: process.env.TELNYX_PHONE_NUMBER,
        to: finalNumber,
        text: `Your verification code is: ${otp}. Valid for 3 minutes.`,
        messaging_profile_id: process.env.MESSAGING_PROFILE_ID,
      };

      // Make sure 'to' number is in E.164 format
      const formattedNumber = finalNumber.startsWith('+')
        ? finalNumber
        : `+${finalNumber}`;


      // Function to add delay
      const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

      try {
        // Send the request to Telnyx API
        const response = await axios.post(
          `${process.env.TELNYX_URL}/messages`,
          {
            from: process.env.TELNYX_PHONE_NUMBER,
            to: formattedNumber, // Use formatted number
            text: `Mindful Girl Love: Use ${otp} to verify your account. Expires in 5 minutes`,
            messaging_profile_id: process.env.MESSAGING_PROFILE_ID,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.TELNYX_API_KEY}`,
            },
          },
        );

        // Wait for 2 seconds (or adjust as needed)
        await delay(2000);

        // Extract the messageId from the response
        const messageId = response?.data?.data?.id;

        // If messageId is missing, throw an error
        if (!messageId) {
          const logDto: CreateTelnyxLogDto = {
            mobileNumber: formattedNumber,
            errorDetails: response?.data || "missing messageId from telnyx response",
          };
          await this.telnyxLogService.create(logDto)
          throw errorResponse;
        }

        // Now check the delivery status with messageId
        const statusResponse = await axios.get(
          `${process.env.TELNYX_URL}/messages/${messageId}`,
          {
            headers: {
              Authorization: `Bearer ${process.env.TELNYX_API_KEY}`,
            },
          },
        );
        // Extract status from the statusResponse
        const messageStatus = statusResponse?.data?.data?.to[0]?.status;

        // If messageStatus is missing or invalid, throw an error
        if (!messageStatus) {
          const logDto: CreateTelnyxLogDto = {
            mobileNumber: formattedNumber,
            errorDetails: statusResponse?.data?.data || "messageStatus is missing or invalid",
          };
          await this.telnyxLogService.create(logDto)
          throw errorResponse;
        }

        // Check if the message was delivered successfully
        if (validStatuses.includes(messageStatus)) {
          return { message: 'OTP sent successfully' };
        } else {

          const logDto: CreateTelnyxLogDto = {
            mobileNumber: formattedNumber,
            errorDetails: statusResponse?.data?.data || "messageStatus not found in validStatuses",
          };
          await this.telnyxLogService.create(logDto)
          throw errorResponse;
        }
      } catch (apiError) {
        const errorData = apiError?.response?.data
        const logDto: CreateTelnyxLogDto = {
          mobileNumber: formattedNumber,
          errorDetails: errorData,
        };
        await this.telnyxLogService.create(logDto)
        // Log detailed API error information
        console.error('Telnyx API error details:');
        console.error('Status:', apiError.response?.status);
        console.error(
          'Response data:',
          JSON.stringify(apiError.response?.data, null, 2),
        );
        console.error('Error message:', apiError.message);
        // Throw a more informative error
        throw errorResponse;
      }
    } catch (error) {
      throw new BadRequestException(
        'OTP could not be sent at the moment. Please try again later',
      );
    }
  }

  async verifyOTP(
    verifyOTPDto: VerifyOtpDto,
  ): Promise<{ user: UserEntity; jwtToken: string }> {
    const { mobileNumber, otp, password, confirmPassword } = verifyOTPDto;

    const user = await this.userRepository.findOne({
      where: { mobileNumber, isDeleted: false },
    });

    if (!user) throw new BadRequestException('User not found');
    if (user.otp !== otp) throw new BadRequestException('Invalid OTP');
    if (user?.otpExpiryTime && new Date() > user?.otpExpiryTime)
      throw new BadRequestException('OTP has expired');

    // Clear OTP after use
    user.otp = '';
    user.otpExpiryTime = null;

    // If password fields provided, treat as sign-up
    if (password || confirmPassword) {
      if (!password || !confirmPassword)
        throw new BadRequestException('Both password and confirmPassword are required');
      if (password !== confirmPassword)
        throw new BadRequestException('Passwords do not match');

      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    const updatedUser = await this.userRepository.save(user);

    const jwtToken = this.jwtService.sign({ id: updatedUser?.id, role: updatedUser?.role });

    // Ensure user has a spiritualPractices object
    if (!updatedUser.spiritualPractices) {
      updatedUser.spiritualPractices = { questionnaire: [], activities: [] } as any;
    }


    // Enrich the questionnaire
    const questionnaireData = updatedUser.spiritualPractices?.questionnaire || [];
    let enrichedQuestions: EnrichedQuestion[] = [];

    // Check if there are questionnaire entries
    if (Array.isArray(questionnaireData) && questionnaireData.length > 0) {
      const questionIds = questionnaireData.map(q => q.questionId);
      const questions = await this.question.find({ where: { id: In(questionIds) } });

      enrichedQuestions = questions.map(question => {
        const answerEntry = questionnaireData.find(q => q.questionId === question.id);
        return {
          questionId: question.id,
          text: question.text,
          type: question.type,
          answer: answerEntry?.answer || '', // Default to empty string if no answer found
        };
      });
    }


    // Assign enriched questionnaire to the user
    updatedUser.spiritualPractices.questionnaire = enrichedQuestions;

    // Get activities IDs from spiritualPractices.activities
    const activityIds = updatedUser.spiritualPractices?.activities || [];

    // Build the raw SQL query to fetch activities based on the IDs
    const query = `SELECT * FROM activities WHERE id IN (${activityIds.join(',')})`;

    if (Array.isArray(activityIds) && activityIds.length > 0) {
      // Execute the raw SQL query using TypeORM's query method
      const activities = await this.activityRepository.query(query);

      // Ensure all the fetched activities are assigned to spiritualPractices
      updatedUser.spiritualPractices.activities = activities.length > 0 ? activities : []; // Assign fetched activities or empty array
    } else {
      updatedUser.spiritualPractices.activities = []; // Assign empty if no activityIds present
    }

    // Remove password before sending user object
    const { password: _removed, ...safeUser } = updatedUser;

    // Update user with token and return safeUser
    // await this.userService.updateUser(updatedUser, updatedUser?.id, jwtToken);
    return {
      user: safeUser as UserEntity,
      jwtToken,
    };
  }

  async loginWithPassword(
    mobileNumber: string,
    password: string,
  ): Promise<{ user: UserEntity; jwtToken: string }> {
    const user = await this.userRepository.findOne({
      where: { mobileNumber, isDeleted: false },
    });

    if (!user || !user.password) {
      throw new BadRequestException('User not found or no password set');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new BadRequestException('Invalid password');
    }

    const jwtToken = this.jwtService.sign({ id: user?.id, role: user?.role });

    // const updatedUser = response.user; // extract user from AuthResponseDto

    // Ensure user has a spiritualPractices object
    if (!user.spiritualPractices) {
      user.spiritualPractices = { questionnaire: [], activities: [] } as any;
    }


    // Enrich the questionnaire
    const questionnaireData = user.spiritualPractices?.questionnaire || [];
    let enrichedQuestions: EnrichedQuestion[] = [];

    // Check if there are questionnaire entries
    if (Array.isArray(questionnaireData) && questionnaireData.length > 0) {
      const questionIds = questionnaireData.map(q => q.questionId);
      const questions = await this.question.find({ where: { id: In(questionIds) } });

      enrichedQuestions = questions.map(question => {
        const answerEntry = questionnaireData.find(q => q.questionId === question.id);
        return {
          questionId: question.id,
          text: question.text,
          type: question.type,
          answer: answerEntry?.answer || '', // Default to empty string if no answer found
        };
      });
    }


    // Assign enriched questionnaire to the user
    user.spiritualPractices.questionnaire = enrichedQuestions;

    // Get activities IDs from spiritualPractices.activities
    const activityIds = user.spiritualPractices?.activities || [];

    // Build the raw SQL query to fetch activities based on the IDs
    const query = `SELECT * FROM activities WHERE id IN (${activityIds.join(',')})`;

    if (Array.isArray(activityIds) && activityIds.length > 0) {
      // Execute the raw SQL query using TypeORM's query method
      const activities = await this.activityRepository.query(query);

      // Ensure all the fetched activities are assigned to spiritualPractices
      user.spiritualPractices.activities = activities.length > 0 ? activities : []; // Assign fetched activities or empty array
    } else {
      user.spiritualPractices.activities = []; // Assign empty if no activityIds present
    }

    // Remove sensitive data
    const { password: _removed, ...safeUser } = user;

    return {
      jwtToken,
      user: safeUser as UserEntity, // Type assertion to ensure compliance
    };
  }


  async changePasswordWithOldPassword(
    userId: number,
    oldPassword: string,
    newPassword: string,
    confirmPassword: string,
  ): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { id: userId, isDeleted: false },
    });

    if (!user || !user.password) {
      throw new BadRequestException('User not found or password not set');
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw new BadRequestException('Old password is incorrect');
    }

    if (!newPassword || !confirmPassword || newPassword !== confirmPassword) {
      throw new BadRequestException('New password and confirm password must match');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await this.userRepository.save(user);

    return { message: 'Password changed successfully' };
  }

  private generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private getOTPExpiryTime() {
    return new Date(Date.now() + 5 * 60 * 1000); // 3 minutes from now
  }
}
