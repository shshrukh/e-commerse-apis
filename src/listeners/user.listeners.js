import { eventBus } from "../events/event.bus.js";
import { UserEvents } from "../events/event.constants.js";
import { confirmRegistration } from "../emails/confirmRegistration.js";
import { sendEmail } from "../utils/sendEmail.js";



eventBus.on(UserEvents.REGISTER, async(user)=>{
    try {
        const html = confirmRegistration(user.name, user.email, user.verificationToken);
        await sendEmail(user.email, "User Registration Successful",html);
        console.log(`Email sent successfully to ${user.email}`);
        
    } catch (error) {
        console.error('Error sending registration email:', error)
    }
});