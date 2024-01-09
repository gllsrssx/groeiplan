export default {
	now: '',
	userId : '',
	userName : '',
	userMail : '',
	subject : '',
	message : '',
	
	async sendEmailToUsers() {
    const delay = 1000 * 60 * 60 * 24 * 5; // timeout in milliseconds, last * is Days
    const now = new Date();

    for (const user of get_users.data) {
        this.now = now.toISOString(); 
        this.userId = user._id;
        this.userName = user.name;
        this.userMail = user.email;
        this.subject = 'GAP TIME!';		
			
				// rest of the code
        const lastEmailSent = new Date(user.lastEmailSent);
        const calc = now - lastEmailSent;

        if (calc <= delay) {
            console.log(`Skipping email to ${this.userName} - last email sent recently.`);
            continue; // Skip sending an email if the last email was sent within the delay
        }

				// mail message
				this.message = `
				hi, ${user.name}
				test bericht, hallo ik ben automated,
				zie je terug binnen 5 dagen.

				GAP @ ${appsmith.URL.fullPath}
				`;
        // Update mail delay here
        update_mail_delay.run(); // Ensure this operation completes if it's async

        try {
            await send_email.run();
            console.log(`Email sent to ${this.userName}`);
        } catch (error) {
            console.error(`Failed to send email to ${user.email}: ${error}`);
        }
		}
	}
}