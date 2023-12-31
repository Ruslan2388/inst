import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configNestApp } from '../src/config.main';

describe('AuthController (e2e)', () => {
    let app: INestApplication;
    let userConfirmCode;
    let accessToken;
    let cookie: string[];
    let passRecoveryCode;

    const badUserInput = {
        userName: 'eja777one',
        email: 'eja777one@gmail.com',
        password: '123',
    };

    const badUserInputError = {
        errorsMessages: [
            {
                message: expect.any(String),
                field: 'password',
            },
        ],
    };

    const emailInputError = {
        errorsMessages: [
            {
                message: expect.any(String),
                field: 'email',
            },
        ],
    };

    const confirmCodeInputError = {
        errorsMessages: [
            {
                message: expect.any(String),
                field: 'code',
            },
        ],
    };

    const passRecoveryCodeInputError = {
        errorsMessages: [
            {
                message: expect.any(String),
                field: 'code',
            },
        ],
    };

    const userInput = {
        userName: 'eja777one',
        email: 'eja777one@gmail.com',
        password: '1234567',
    };

    const userInput2 = {
        userName: 'otherUser',
        email: 'eja777one@gmail.com',
        password: '1234567',
    };

    const badEmailInput = {
        email: 'pinguin123@gmail.com',
    };

    const userProfileInput = {
        userName: 'Harley_Quinn',
        name: 'Margo',
        surname: 'Robbie',
        birthday: '02.07.1990',
        city: 'Dalby',
        aboutMe: 'Famous actress',
    };

    const userUpdateProfileInput = {
        userName: 'Harley_Quinn',
        name: 'Margo',
        surname: 'Robbie',
        birthday: '02.07.1990',
        city: 'Dalby',
        aboutMe: 'I play Harley Quinn in the Suicide Squad movie',
    };

    const badUserProfileInput = {
        userName: 'Harley_Quinn',
        surname: 'Robbie',
        birthday: '02.07.1990',
        city: 'Dalby',
        aboutMe: 'Famous actress',
    };

    const userProfileInputError = {
        errorsMessages: [
            {
                message: expect.any(String),
                field: 'name',
            },
        ],
    };

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();
    });

    it('Delete all data', async () => {
        await request(app.getHttpServer()).delete(`/testing/all-data`).expect(HttpStatus.NO_CONTENT);
    });

    // TEST #01
    it("User can't registrate. Wrong password. Status 400", async () => {
        const response = await request(app.getHttpServer()).post(`/auth/registration`).send(badUserInput);

        const result = response.body;

        expect(response).toBeDefined();
        expect(response.status).toBe(HttpStatus.BAD_REQUEST);
        expect(result).toStrictEqual(badUserInputError);
    });

    // TEST #02
    it('User should be registrated. Status 204', async () => {
        const response = await request(app.getHttpServer()).post(`/auth/registration`).send(userInput);

        const result = response.body;

        expect(response).toBeDefined();
        expect(response.status).toBe(HttpStatus.NO_CONTENT);
    });

    // TEST #03
    it("User can't registrate. Email already exist. Status 400", async () => {
        const response = await request(app.getHttpServer()).post(`/auth/registration`).send(userInput2);

        const result = response.body;

        expect(response).toBeDefined();
        expect(response.status).toBe(HttpStatus.BAD_REQUEST);
        expect(result).toStrictEqual(emailInputError);
    });

    // TEST #04
    it('Resend email confirmCode. Email is un exist. Status 400', async () => {
        const response = await request(app.getHttpServer()).post(`/auth/registration-email-resending`).send(badEmailInput);

        const result = response.body;

        expect(response).toBeDefined();
        expect(response.status).toBe(HttpStatus.BAD_REQUEST);
        expect(result).toStrictEqual(emailInputError);
    });

    // TEST #05
    it('Resend email confirmCode. Status 204', async () => {
        const response = await request(app.getHttpServer()).post(`/auth/registration-email-resending`).send({ email: userInput.email });

        const result = response.body;

        expect(response).toBeDefined();
        expect(response.status).toBe(HttpStatus.NO_CONTENT);
    });

    // TEST #00
    it('Get confirm code for users. Status 204', async () => {
        const response = await request(app.getHttpServer()).get(`/testing/db-user/${userInput.email}`);

        userConfirmCode = response.body?.emailConfirmation?.confirmationCode;

        expect(response).toBeDefined();
        expect(response.status).toBe(HttpStatus.OK);
    });

    // TEST #06
    it("Activate user's account. Incorrect confirmCode. Status 400", async () => {
        const response = await request(app.getHttpServer()).post(`/auth/registration-confirmation`).send({ code: '123' });

        const result = response.body;

        expect(response).toBeDefined();
        expect(response.status).toBe(HttpStatus.BAD_REQUEST);
        expect(result).toStrictEqual(confirmCodeInputError);
    });

    // TEST #07
    it("Activate user's account. Status 204", async () => {
        const response = await request(app.getHttpServer()).post(`/auth/registration-confirmation`).send({ code: userConfirmCode });

        const result = response.body;

        expect(response).toBeDefined();
        expect(response.status).toBe(HttpStatus.NO_CONTENT);
    });

    // TEST #08
    it("User can't login. Wrong password. Status 401", async () => {
        const response = await request(app.getHttpServer()).post(`/auth/login`).send({
            email: userInput.email,
            password: '123',
        });

        const result = response.body;

        expect(response).toBeDefined();
        expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    // TEST #09
    it('User login. Status 200', async () => {
        const response = await request(app.getHttpServer()).post(`/auth/login`).send(userInput);

        const result = response.body;

        expect(response).toBeDefined();
        expect(response.status).toBe(HttpStatus.OK);
        expect(result).toStrictEqual({ accessToken: expect.any(String) });

        accessToken = result.accessToken;
        cookie = response.get('Set-Cookie');
    });

    // TEST #10
    it('Refresh tokens for users. Bad cookie. Status 401', async () => {
        const response = await request(app.getHttpServer()).post(`/auth/refresh-token`).set('Cookie', '123');

        const result = response.body;

        expect(response).toBeDefined();
        expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    // TEST #11
    it('Refresh tokens for users. Status 200', async () => {
        const response = await request(app.getHttpServer()).post(`/auth/refresh-token`).set('Cookie', cookie);

        const result = response.body;

        expect(response).toBeDefined();
        expect(response.status).toBe(HttpStatus.OK);
        expect(result).toStrictEqual({ accessToken: expect.any(String) });

        accessToken = result.accessToken;
        cookie = response.get('Set-Cookie');
    });

    // TEST #12
    it('Get recovery code to set new password. Status 400', async () => {
        const response = await request(app.getHttpServer()).post(`/auth/password-recovery-code`).send(badEmailInput);

        const result = response.body;

        expect(response).toBeDefined();
        expect(response.status).toBe(HttpStatus.BAD_REQUEST);
        expect(result).toStrictEqual(emailInputError);
    });

    // TEST #13
    it('Get recovery code to set new password. Status 204', async () => {
        const response = await request(app.getHttpServer()).post(`/auth/password-recovery-code`).send({ email: userInput.email });

        const result = response.body;

        expect(response).toBeDefined();
        expect(response.status).toBe(HttpStatus.NO_CONTENT);
    });

    // TEST #00
    it('Get recovery code to set new password. Status 204', async () => {
        const response = await request(app.getHttpServer()).get(`/testing/db-user/${userInput.email}`);

        passRecoveryCode = response.body?.emailConfirmation?.recoveryCode;

        expect(response).toBeDefined();
        expect(response.status).toBe(HttpStatus.OK);
    });

    // TEST #14
    it('Set new password to user. Status 400', async () => {
        const response = await request(app.getHttpServer()).post(`/auth/new-password`).send({
            newPassword: 'qwerty123',
            recoveryCode: '123',
        });

        const result = response.body;

        expect(response).toBeDefined();
        expect(response.status).toBe(HttpStatus.BAD_REQUEST);
        expect(result).toStrictEqual(passRecoveryCodeInputError);
    });

    // TEST #15
    it('Set new password to user. Status 204', async () => {
        const response = await request(app.getHttpServer()).post(`/auth/new-password`).send({
            newPassword: 'qwerty123',
            recoveryCode: passRecoveryCode,
        });

        const result = response.body;

        userInput.password = 'qwerty123';

        expect(response).toBeDefined();
        expect(response.status).toBe(HttpStatus.NO_CONTENT);
    });

    // TEST #16
    it('User login. Status 401', async () => {
        const response = await request(app.getHttpServer())
            .post(`/auth/login`)
            .send({ ...userInput, password: '1234567' });

        const result = response.body;

        expect(response).toBeDefined();
        expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    // TEST #17
    it('User login. Status 200', async () => {
        const response = await request(app.getHttpServer()).post(`/auth/login`).send(userInput);

        const result = response.body;

        expect(response).toBeDefined();
        expect(response.status).toBe(HttpStatus.OK);
        expect(result).toStrictEqual({ accessToken: expect.any(String) });

        accessToken = result.accessToken;
        cookie = response.get('Set-Cookie');
    });

    // TEST #18
    it("Get user's info. Status 401", async () => {
        const response = await request(app.getHttpServer()).get(`/auth/me`).set('Authorization', `Bearer {accessToken.accessToken}`);

        const result = response.body;

        expect(response).toBeDefined();
        expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    // TEST #19
    it("Get user's info. Status 200", async () => {
        const response = await request(app.getHttpServer()).get(`/auth/me`).set('Authorization', `Bearer ${accessToken}`);

        const result = response.body;

        expect(response).toBeDefined();
        expect(response.status).toBe(HttpStatus.OK);
        expect(result).toStrictEqual({
            email: userInput.email,
            userId: expect.any(String),
            userName: userInput.userName,
        });
    });

    // TEST #20
    it('User logout. Status 401', async () => {
        const response = await request(app.getHttpServer()).post(`/auth/logout`).set('Cookie', '123');

        const result = response.body;

        expect(response).toBeDefined();
        expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    // TEST #21
    it('User logout. Status 204', async () => {
        const response = await request(app.getHttpServer()).post(`/auth/logout`).set('Cookie', cookie);

        const result = response.body;

        expect(response).toBeDefined();
        expect(response.status).toBe(HttpStatus.NO_CONTENT);
    });

    // TEST #22
    it('User logout. Status 401', async () => {
        const response = await request(app.getHttpServer()).post(`/auth/logout`).set('Cookie', cookie);

        const result = response.body;

        expect(response).toBeDefined();
        expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    // TEST #23
    it('User login. Status 200', async () => {
        const response = await request(app.getHttpServer()).post(`/auth/login`).send(userInput);

        const result = response.body;

        expect(response).toBeDefined();
        expect(response.status).toBe(HttpStatus.OK);
        expect(result).toStrictEqual({ accessToken: expect.any(String) });

        accessToken = result.accessToken;
        cookie = response.get('Set-Cookie');
    });

    // TEST #24
    it('User try to add profile. Status 401', async () => {
        const response = await request(app.getHttpServer())
            .post(`/profile/createProfile/${userInput.userName}`)
            .set('Authorization', `Bearer {accessToken.accessToken}`)
            .send(userProfileInput);

        const result = response.body;

        expect(response).toBeDefined();
        expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    // TEST #25
    it('User try to add profile. Status 400', async () => {
        const response = await request(app.getHttpServer())
            .post(`/profile/createProfile/${userInput.userName}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send(badUserProfileInput);

        const result = response.body;

        expect(response).toBeDefined();
        expect(response.status).toBe(HttpStatus.BAD_REQUEST);
        expect(result).toStrictEqual(userProfileInputError);
    });

    // TEST #26
    it('User add profile. Status 200', async () => {
        const response = await request(app.getHttpServer())
            .post(`/profile/createProfile/${userInput.userName}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send(userProfileInput);

        const result = response.body;

        expect(response).toBeDefined();
        expect(response.status).toBe(HttpStatus.NO_CONTENT);
        userInput.userName = userProfileInput.userName;
    });

    // TEST #27
    it('User try to edit profile. Status 401', async () => {
        const response = await request(app.getHttpServer()).put(`/profile/edit/${userInput.userName}`).set('Authorization', `Bearer {accessToken}`).send(userUpdateProfileInput);

        const result = response.body;

        expect(response).toBeDefined();
        expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    // TEST #28
    it('User try to edit profile. Status 400', async () => {
        const response = await request(app.getHttpServer()).put(`/profile/edit/${userInput.userName}`).set('Authorization', `Bearer ${accessToken}`).send(badUserProfileInput);

        const result = response.body;

        expect(response).toBeDefined();
        expect(response.status).toBe(HttpStatus.BAD_REQUEST);
        expect(result).toStrictEqual(userProfileInputError);
    });

    // TEST #29
    it('User edit profile. Status 204', async () => {
        const response = await request(app.getHttpServer()).put(`/profile/edit/${userInput.userName}`).set('Authorization', `Bearer ${accessToken}`).send(userUpdateProfileInput);

        const result = response.body;

        expect(response).toBeDefined();
        expect(response.status).toBe(HttpStatus.NO_CONTENT);
    });

    // TEST #30
    it('User try to get profile. Status 404', async () => {
        const response = await request(app.getHttpServer()).get(`/queryProfile/{userInput.userName}`).set('Authorization', `Bearer ${accessToken}`);

        const result = response.body;

        expect(response).toBeDefined();
        expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });

    // TEST #31
    it('User get profile. Status 200', async () => {
        const response = await request(app.getHttpServer()).get(`/queryProfile/${userInput.userName}`).set('Authorization', `Bearer ${accessToken}`);

        const result = response.body;

        expect(response).toBeDefined();
        expect(response.status).toBe(HttpStatus.OK);
        expect(result).toStrictEqual({
            _id: expect.any(String),
            profileInfo: { ...userUpdateProfileInput },
        });
    });
});
