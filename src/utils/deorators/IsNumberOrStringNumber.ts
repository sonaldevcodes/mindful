import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";

@ValidatorConstraint({ name: 'IsNumberOrStringNumber', async: false })
export class IsNumberOrStringNumber implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    // Allow if the value is a number or can be parsed into a number
    if (typeof value === 'number') {
        if(Number.isNaN(value)){
            return false
        }
      return true;
    }
    if (typeof value === 'string') {
      return !isNaN(Number(value));
    }
    return false;


  }

  defaultMessage(args: ValidationArguments) {
    return 'Each value in $property must be a valid number or a numeric string';
  }
}