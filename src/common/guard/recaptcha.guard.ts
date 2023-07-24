import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class RecaptchaGuard implements CanActivate {
    constructor(private readonly httpService: HttpService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const { body } = context.switchToHttp().getRequest();
        const { data } = await this.httpService
            .post(`https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET}&response=${body.recaptchaValue}`)
            .toPromise();

        if (!data.success) {
            throw new ForbiddenException();
        }

        return true;
    }
}
