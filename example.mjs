const exampleRequests = {
  register: {
    method: 'POST',
    url: 'http://localhost:3000/api/auth/register',
    body: {
      email: 'user@example.com',
      password: 'strongpassword123',
    },
  },
  login: {
    method: 'POST',
    url: 'http://localhost:3000/api/auth/login',
    body: {
      email: 'user@example.com',
      password: 'strongpassword123',
    },
  },
  profile: {
    method: 'GET',
    url: 'http://localhost:3000/api/profile',
    headers: {
      Authorization: 'Bearer <jwt-token>',
    },
  },
};

console.log(JSON.stringify(exampleRequests, null, 2));
