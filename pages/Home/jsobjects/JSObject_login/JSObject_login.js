export default {
	async saveUser() {
		if (Api_continue_google_login.data.email) {
			await save_user.run();
		}
	},
	async getUser() {
		if (Api_continue_google_login.data.email) {
			await get_user_api.run();
		}
	},
	async storeUser() {
		if (Api_continue_google_login.data.email && get_user_api.data[0]) {
			storeValue('user', get_user_api.data[0]);
		}
	},
	async executeInOrder() {
		await this.saveUser();
		await this.getUser();
		await this.storeUser();
	}
}
