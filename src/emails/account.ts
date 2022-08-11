import sgMail from "@sendgrid/mail"

const sgAPIKey = process.env.SENDGRID_API_KEY;
const from = "marwanabbas2909@gmail.com";

if (sgAPIKey)
    sgMail.setApiKey(sgAPIKey);

export async function greetUser({ email, name }: { email: string, name: string }) {
    sgMail.send({
        to: email,
        from,
        subject: `Welcome ${ name }!`,
        text: `Thanks for joining us`,
    })
}

export async function sendCancellationEmail({ email, name }: { email: string, name: string }) {
    sgMail.send({
        to: email,
        from,
        subject: `Goodbye ${name} :(`,
        text: `We will miss you ${name}, please let us know how we could've kept you on board`
    })
    
}

