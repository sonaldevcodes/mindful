import { DataSource } from 'typeorm';
import { UserEntity } from '../../users/infrastructure/persistence/relational/entities/user.entity';
import { Role } from '../../users/enum/role.enum';

export class UserSeed {
  async run(dataSource: DataSource) {
    const userRepository = dataSource.getRepository(UserEntity);
    
    const users = [
      {
        mobileNumber: '9138391283',
        isoCode: 'IN',
        countryCode: '+91',
        fullName: 'Admin',
        birthday: new Date('1990-01-01'),
        isDeleted: false,
        role: Role.ADMIN,
      },
    ];

    for (const user of users) {
      const existingUser = await userRepository.findOne({
        where: { mobileNumber: user.mobileNumber },
      });

      if (!existingUser) {
        await userRepository.save(user);
        console.log(`User ${user.fullName} created.`);
      } else {
        console.log(`User with mobile number ${user.mobileNumber} already exists. Skipping.`);
      }
    }
  }
}
