'use strict';

// Load modules

const Bell = require('../../');
const { expect } = require('code');
const { Server } = require('hapi');
const Hoek = require('hoek');
const Lab = require('lab');
const Mock = require('../mock');


// Test shortcuts

const { describe, it } = exports.lab = Lab.script();


describe('google', () => {

    it('authenticates with mock', { parallel: false }, async () => {

        const mock = new Mock.V2();
        const provider = await mock.start();

        const server = Server({ host: 'localhost', port: 80 });
        await server.register(Bell);



        const custom = Bell.providers.google();
        Hoek.merge(custom, provider);

        const profile = {
            sub: '1234567890',
            name: 'steve smith',
            given_name: 'steve',
            family_name: 'smith',
            email: 'steve@example.com'
        };

        Mock.override('https://www.googleapis.com/oauth2/v3/userinfo', profile);

        server.auth.strategy('custom', 'bell', {
            password: 'cookie_encryption_password_secure',
            isSecure: false,
            clientId: 'google',
            clientSecret: 'secret',
            provider: custom
        });

        server.route({
            method: '*',
            path: '/login',
            config: {
                auth: 'custom',
                handler: function (request, h) {

                    return request.auth.credentials;
                }
            }
        });

        const res = await server.inject('/login');

        const cookie = res.headers['set-cookie'][0].split(';')[0] + ';';
        const mockRes = await mock.server.inject(res.headers.location);

        const response = await server.inject({ url: mockRes.headers.location, headers: { cookie } });

        Mock.clear();
        expect(response.result).to.equal({
            provider: 'custom',
            token: '456',
            expiresIn: 3600,
            refreshToken: undefined,
            query: {},
            profile: {
                id: '1234567890',
                displayName: 'steve smith',
                name: {
                    given_name: 'steve',
                    family_name: 'smith'
                },
                email: 'steve@example.com',
                raw: profile
            }
        });

        await mock.stop();
    });
});
            });
        });
    });
});

});
