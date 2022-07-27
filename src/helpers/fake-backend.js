import { Role } from './'

export function configureFakeBackend() {
    let users = [
        { id: 1, username: 'admin', password: 'admin', firstName: 'Admin',     lastName: 'User',      result: '',    role: Role.Admin },
        { id: 2, username: 'user1', password: 'test1234', firstName: 'John',   lastName: 'Smith',     result : '1',  role: Role.User },
        { id: 3, username: 'user2', password: 'test1234', firstName: 'Arnold', lastName: 'Smith',     result: '7',   role: Role.User },
        { id: 4, username: 'user3', password: 'test1234', firstName: 'Miki',   lastName: 'Thomson',   result: '4',   role: Role.User },
        { id: 5, username: 'user4', password: 'test1234', firstName: 'Nika',   lastName: 'Leps',      result: '8 ',  role: Role.User },
        { id: 6, username: 'user5', password: 'test1234', firstName: 'Maxim',  lastName: 'Student5',  result: '10 ', role: Role.User }

    ];
    let realFetch = window.fetch;
    window.fetch = function (url, opts) {
        const authHeader = opts.headers['Authorization'];
        const isLoggedIn = authHeader && authHeader.startsWith('Bearer fake-jwt-token');
        const roleString = isLoggedIn && authHeader.split('.')[1];
        const role = roleString ? Role[roleString] : null;

        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // authenticate - public
                if (url.endsWith('/users/authenticate') && opts.method === 'POST') {
                    const params = JSON.parse(opts.body);
                    const user = users.find(x => x.username === params.username && x.password === params.password);
                    if (!user) return error('Username or password is incorrect');
                    return ok({
                        id: user.id,
                        username: user.username,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        result: user.result,
                        role: user.role,
                        token: `fake-jwt-token.${user.role}`
                    });
                }

                if (url.match(/\/users\/\d+$/) && opts.method === 'GET') {
                    if (!isLoggedIn) return unauthorised();

                    let urlParts = url.split('/');
                    let id = parseInt(urlParts[urlParts.length - 1]);

                    const currentUser = users.find(x => x.role === role);
                    if (id !== currentUser.id && role !== Role.Admin) return unauthorised();

                    const user = users.find(x => x.id === id);
                    return ok(user);
                }

                if (url.endsWith('/users') && opts.method === 'GET') {
                    if (role !== Role.Admin) return unauthorised();
                    return ok(users);
                }

                realFetch(url, opts).then(response => resolve(response));

                function ok(body) {
                    resolve({ ok: true, text: () => Promise.resolve(JSON.stringify(body)) })
                }

                function unauthorised() {
                    resolve({ status: 401, text: () => Promise.resolve(JSON.stringify({ message: 'Unauthorised' })) })
                }

                function error(message) {
                    resolve({ status: 400, text: () => Promise.resolve(JSON.stringify({ message })) })
                }
            }, 500);
        });
    }
}