type loginCredentials = {
  username: string;
  password: string;
};

export function verifyLogin(data: loginCredentials): void {
  console.log(data);
}
