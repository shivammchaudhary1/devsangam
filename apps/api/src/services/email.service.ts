interface PasswordResetEmail {
  email: string;
  name: string;
  resetUrl: string;
}

export async function sendPasswordResetEmail(message: PasswordResetEmail) {
  /*
   * Development transport.
   *
   * Replace this with the
   * production email provider
   * before deployment.
   */
  console.log('\n================================');

  console.log('DEVSANGAM PASSWORD RESET');

  console.log('To:', message.email);

  console.log('User:', message.name);

  console.log('Reset URL:', message.resetUrl);

  console.log('================================\n');
}
