import { transporter } from "../config/nodemailer.config.js";


export const sendEmail = async (useremail, subject, html) => {
    try {
        await transporter.sendMail({
            from: `UCONNECT INTERS Application < ${process.env.EMAIL}> `,
            to: useremail,
            subject: subject,
            html: html
        })
    } catch (error) {
        throw new Error(error);
    }
}

