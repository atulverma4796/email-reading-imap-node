// const Pop3Client = require("mailpop3")
// const { simpleParser } = require("mailparser")
// const tls = require("tls")

// const pop3Config = {
//   host: "pop.gmail.com",
//   port: 995,
//   tls: true,
//   username: "atul.verma@soforix.com",
//   password: "ivlk igry picz taxl",
// }
// pop3Config.rejectUnauthorized = false
// const getEmails = () => {
//   try {
//     const options = {
//       host: pop3Config.host,
//       port: pop3Config.port,
//       tls: {
//         rejectUnauthorized: false,
//       },
//     }

//     const socket = tls.connect(options)

//     socket.on("secureConnect", () => {
//       const client = new Pop3Client(pop3Config.port, socket)

//       client.on("connect", () => {
//         console.log("Connected to POP3 server")

//         client.login(pop3Config.username, pop3Config.password)
//       })

//       client.on("login", () => {
//         console.log("Logged in")

//         client.list()
//       })

//       client.on("list", (messageCount) => {
//         console.log(`Found ${messageCount} messages`)
//         for (let i = 1; i <= messageCount; i++) {
//           client.retr(i)
//         }
//       })

//       client.on("retr", (message) => {
//         simpleParser(message.text, async (err, parsed) => {
//           if (err) {
//             console.error("Error while parsing", err)
//           } else {
//             console.log("Subject:", parsed.subject)
//             console.log("Text body:", parsed.text)
//           }
//         })
//       })

//       client.on("end", () => {
//         console.log("Done fetching all messages!")
//         client.quit()
//       })

//       client.on("error", (err) => {
//         console.error("Error:", err)
//       })

//       client.connect()
//     })
//   } catch (error) {
//     console.error("Error while getting the email:", error)
//   }
// }

// getEmails()

const Pop3Command = require("node-pop3")
const simpleParser = require("mailparser").simpleParser

const pop3 = new Pop3Command({
  user: "atul.verma@soforix.com",
  //   password: "ivlk igry picz taxl",
  password: "Atulverma1980@",

  host: "pop.imitate.email",
  servername: "pop.imitate.email",
  port: 995,
  tls: true, // the connection is encrypted over SSL
  debug: true,
})

const msgNum = 1
pop3.on("debug", (message) => {
  console.log("POP3 Debug:", message)
})
;(async () => {
  // get the list of messages - this also connects and does USER/PASS as needed
  const list = await pop3.LIST()
  console.log(list)

  // execute the STAT command
  const [statInfo] = await pop3.command("STAT")
  console.log(statInfo)

  // get the raw content of the first message
  const str = await pop3.RETR(msgNum)

  // parse the email using mailparser
  let email = await simpleParser(str)
  console.log(email.subject)
  //   pop3.on("debug", (message) => {
  //     console.log("POP3 Debug:", message)
  //   })
  // end the session
  await pop3.QUIT()
})()
