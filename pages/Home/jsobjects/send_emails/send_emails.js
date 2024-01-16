export default {
	now: '',
	userId: '',
	userName: '',
	userMail: '',
	subject: '',
	message: '',
	coachId: '',

	async sendEmailToUsers() {
		const userDelay = 1000 * 60 * 60 * 24 * 14; // 2 weken in milliseconden
		const coachDelay = 1000 * 60 * 60 * 24 * 21; // 3 weken in milliseconden
		const now = new Date();

		for (const user of get_users.data) {
			this.now = now.toISOString();
			this.userId = user._id;
			this.userName = user.name;
			this.userMail = user.email;
			this.subject = 'GAP TIJD!';
			this.coachId = user.coachId;

			// Rest van de code
			const lastEmailSent = new Date(user.lastEmailSent);
			const calc = now - lastEmailSent;

			if (calc <= userDelay) {
				console.log(`Overgeslagen e-mail naar ${this.userName} - laatste e-mail recentelijk verzonden.`);
				continue; // Sla e-mail over als de laatste e-mail binnen het gebruikersvertraging is verzonden
			}

			let message = '';
			const userEvaluations = get_all_evaluations.data.filter(evaluation => evaluation.userId === user._id);
			const lastUserEvaluation = userEvaluations.find(evaluation => evaluation.writer === user._id);
			const lastCoachEvaluation = userEvaluations.find(evaluation => evaluation.writer === user.coachId);

			if (lastUserEvaluation && now - new Date(lastUserEvaluation.date) > userDelay) {
				message += `We missen je in de GAP! Het is al een tijdje geleden dat je een zelfevaluatie hebt gedaan. Vergeet niet om je voortgang te controleren!\n\n`;
			}
			if (lastCoachEvaluation && now - new Date(lastCoachEvaluation.date) < coachDelay) {
				message += `Goed nieuws, ${user.name}!\n\nJe coach heeft onlangs een evaluatie voor je voltooid. Neem even de tijd om de feedback te bekijken en ontdek nieuwe manieren om te groeien!\n\n`;
			}

			// Inclusief laatste feedback
			if (lastCoachEvaluation && lastCoachEvaluation.feedback) {
				message += `Hier is de laatste feedback die je hebt ontvangen:\n\n${lastCoachEvaluation.feedback}\n\n`;
			}

			// E-mailbericht
			this.message = `Hey ${user.name},\n\nWe hebben gemerkt dat het alweer een week geleden is dat we voor het laatst contact hebben gehad in de GAP! We hopen dat je alles vindt wat je nodig hebt voor je groeireis.\n\n${message}Vergeet niet om je groeiplan te bekijken voor de laatste updates en activiteiten. Onthoud, we zijn hier om je te ondersteunen, dus als je vragen of feedback hebt, aarzel dan niet om contact met ons op te nemen.\n\nWe kunnen niet wachten om je groei te zien stijgen!\n\nMet vriendelijke groet,\nHet GAP Team\n\nGAP @ ${appsmith.URL.fullPath}`;

			// Werk e-mailvertraging hier bij
			update_mail_delay.run(); // Zorg ervoor dat deze bewerking wordt voltooid als deze asynchroon is

			try {
				await send_email.run();
				console.log(`E-mail verzonden naar ${this.userName}`);
			} catch (error) {
				console.error(`Het verzenden van de e-mail naar ${user.email} is mislukt: ${error}`);
			}

			// Controleer of de gebruiker de coach moet herinneren
			if (
				lastUserEvaluation &&
				!lastCoachEvaluation &&
				now - new Date(lastUserEvaluation.date) <= userDelay
			) {
				// Verzend een herinneringsmail naar de coach
				const coachInfo = get_coach_email.data[0];
				this.userMail = coachInfo.email; // Vervang dit door de functie om de coachinformatie op te halen
				this.subject = 'Dringend: Evaluatieverzoek';
				this.message = `Beste ${coachInfo.name},\n\n${this.userName} heeft onlangs een zelfevaluatie voltooid en wacht vol spanning op jouw feedback. Neem alsjeblieft even de tijd om de evaluatie zo snel mogelijk te verstrekken.\n\nMet vriendelijke groet,\nHet GAP Team`;

				// Verzend de e-mail naar de coach
				try {
					await send_email.run();
					console.log(`Herinneringsmail verzonden naar coach ${coachInfo.email}`);
				} catch (error) {
					console.error(`Het verzenden van de herinneringsmail naar coach ${coachInfo.email} is mislukt: ${error}`);
				}
			}
		}
	}
};


