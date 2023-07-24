import { registerDecorator, ValidationOptions } from 'class-validator';
import { IsEmailInInDBValidator } from '../validators/register.validators';

export function IsEmailInDb(validationOptions?: ValidationOptions) {
    return function (object: any, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: IsEmailInInDBValidator,
        });
    };
}
