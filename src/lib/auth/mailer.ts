// import nodemailer from "nodemailer";

// export const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS, // gunakan app password
//   },
// });

/**
 *
 * This call sends a message to one recipient.
 *
 */
// const Mailjet = require('node-mailjet');

// export async function sendEmail({
//   receiver,
//   nameReceiver,
//   subject,
//   textPart,
//   htmlPart,
// }: {
//   receiver: string;
//   nameReceiver: string;
//   subject: string;
//   textPart: string;
//   htmlPart: string;
// }) {
//   try {
//     const mailjet = new Mailjet({
//       apiKey: process.env.MJ_APIKEY_PUBLIC!,
//       apiSecret: process.env.MJ_APIKEY_PRIVATE!,
//     });

//     const result = await mailjet
//       .post("send", { version: "v3.1" })
//       .request({
//         Messages: [
//           {
//             From: {
//               Email: "luthfichemco@gmail.com",
//               Name: "Notify Online",
//             },
//             To: [
//               {
//                 Email: receiver,
//                 Name: nameReceiver,
//               },
//             ],
//             Subject: subject,
//             TextPart:
//               textPart,
//             HTMLPart: htmlPart,
//           },
//         ],
//       });

//     console.log("Success:", JSON.stringify(result.body, null, 2));
//   } catch (err: unknown) {
//     const error = err as any;

//     const errorObject = {
//       status: error?.statusCode ?? error?.response?.status ?? 500,
//       message: error?.message ?? "Unknown error",
//       details: error?.response?.data ?? null,
//     };

//     console.error(errorObject);
//     throw errorObject;
//   }
// }

type Recipient = {
  name?: string;
  email: string;
};

export async function sendEmail({
  to,
  subject,
  htmlContent,
}: {
  to: Recipient[];
  subject: string;
  htmlContent: string;
}) {
  try {
    const apiKey = process.env.MJ_APIKEY_PUBLIC!;
    const apiSecret = process.env.MJ_APIKEY_PRIVATE!;
  
    const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");

    const body = JSON.stringify({
      sender: {
        email: "luthfichemco@gmail.com",
        name: "Notify Online",
      },
      to: to,
      subject: subject,
      htmlContent: htmlContent,
    });
    // const body = JSON.stringify({
    //   Messages: [
    //     {
    //       From: {
    //         Email: "luthfichemco@gmail.com",
    //         Name: "Notify Online",
    //       },
    //       To: [
    //         {
    //           Email: receiver,
    //           Name: nameReceiver,
    //         },
    //       ],
    //       Subject: subject,
    //       TextPart: textPart,
    //       HTMLPart: htmlPart,
    //     },
    //   ],
    // });
    // console.log(body);
  
    const result = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": process.env.BREVO_API_KEY as string,
        "Content-Type": "application/json",
      },
      body: body,
    });
    // const result = await fetch("https://api.mailjet.com/v3.1/send", {
    //   method: "POST",
    //   headers: {
    //     Authorization: `Basic ${auth}`,
    //     "Content-Type": "application/json",
    //   },
    //   body: body,
    // });

    console.log("Success:", JSON.stringify(result.body, null, 2));
  } catch (err: unknown) {
    const error = err as any;

    const errorObject = {
      status: error?.statusCode ?? error?.response?.status ?? 500,
      message: error?.message ?? "Unknown error",
      details: error?.response?.data ?? null,
    };

    console.error(errorObject);
    throw errorObject;
  }
}