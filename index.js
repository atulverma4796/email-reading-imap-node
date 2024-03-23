const Imap = require("imap")
const fs = require("fs")
const { simpleParser } = require("mailparser")
const imapConfig = {
  user: "USER Email",
  password:
    "OAuth Password will be retrived from google for ex :-ivlk igry picz taxl",
  host: "imap.gmail.com",
  port: 993,
  tls: true,
  tlsOptions: { rejectUnauthorized: false },
}
console.log("here")
const getEmails = () => {
  try {
    console.log("At top of the function")
    const imap = new Imap(imapConfig)
    imap.once("ready", () => {
      imap.openBox("INBOX", false, () => {
        //to fetch latest 25 emails
        const currentDate = new Date()
        const daysAgo = 25
        const sinceDate = new Date(currentDate)
        sinceDate.setDate(currentDate.getDate() - daysAgo)
        imap.search([["SINCE", sinceDate]], (err, result) => {
          if (err) {
            console.error("Error while searching for messages:", err)
            imap.end()
            return
          }
          if (result.length === 0) {
            console.log("No messages to fetch.")
            imap.end()
            return
          }
          const mails = imap.fetch(result, { bodies: "" })
          console.log("Fetching emails...")
          mails.on("message", (msg) => {
            let attachments = []
            msg.on("body", (stream) => {
              simpleParser(stream, async (err, parsed) => {
                // let buffer = "",
                //   count = 0

                // stream.on("data", async function (chunk) {
                //   count += chunk.length
                //   buffer += chunk.toString("utf8")
                //   console.log("buffer==>", buffer)
                // })
                if (err) {
                  console.log("Error while parsing", err)
                } else {
                  attachments = parsed.attachments || []
                  // console.log("Subject:", parsed.subject)
                  // console.log("Text body:", parsed.text)
                  // console.log("attachments:", attachments)
                  if (attachments.length) {
                    attachments.forEach((attachment, index) => {
                      const fileName = attachment?.filename
                      // console.log("fileName", attachment)
                      if (attachment?.contentType === "application/pdf") {
                        // Handle PDF files
                        console.log("PDF file found:", fileName)
                        saveAttachment(attachment.content, fileName, "pdf")
                      } else if (
                        attachment?.contentType === "application/msword" ||
                        attachment?.contentType ===
                          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      ) {
                        // Handle DOCX files
                        console.log("DOCX file found:", fileName)
                        saveAttachment(attachment.content, fileName, "docx")
                      } else if (
                        attachment?.contentType === "application/zip" ||
                        attachment?.contentType ===
                          "application/x-zip-compressed"
                      ) {
                        console.log("ZIP file found:", fileName)
                        const decodedContent = Buffer.from(
                          attachment.content,
                          "base64"
                        )
                        saveAttachment(decodedContent, fileName, "zip")
                      } else {
                        console.log(`Unsupported file type found: ${fileName}`)
                      }
                    })
                  }
                }
              })
            })
            msg.once("attributes", (attrs) => {
              const { uid } = attrs
              // imap.addFlags(uid, ["\\Seen"], () => {
              //   console.log("Here Marked as read")
              // })
            })
          })
          mails.once("error", (ex) => {
            return Promise.reject(ex)
          })
          mails.once("end", () => {
            console.log("Done fetching all messages!")
            imap.end()
          })
        })
      })
    })
    imap.once("error", (err) => {
      console.log("error:", err)
    })

    imap.once("end", () => {
      console.log("Connection ended")
    })

    imap.connect()
  } catch (error) {
    console.log("Error while getting the email:-", error)
  }
}
getEmails()
function saveAttachment(content, fileName, fileType) {
  const sanitizedFileName = fileName.replace(/[^a-z0-9_.-]/gi, "_")
  const fileExtension = fileType || "unknown"
  const filePath = `./attachments/attachment_${sanitizedFileName}`

  const fileStream = fs.createWriteStream(filePath)

  fileStream.write(content)

  fileStream.end()

  fileStream.on("finish", () => {
    console.log(`Done writing to file: ${sanitizedFileName}`)
  })
}
// var Imap = require("imap"),
//   inspect = require("util").inspect

// var imap = new Imap({
//   user: "atul.verma@soforix.com",
//   password: "Atulverma1980@",
//   host: "imap.gmail.com",
//   port: 993,
//   tls: true,
//   tlsOptions: { rejectUnauthorized: false },
// })

// function openInbox(cb) {
//   imap.openBox("INBOX", true, cb)
// }

// imap.once("ready", function () {
//   openInbox(function (err, box) {
//     if (err) throw err
//     var f = imap.seq.fetch("1:3", {
//       bodies: "HEADER.FIELDS (FROM TO SUBJECT DATE)",
//       struct: true,
//     })
//     f.on("message", function (msg, seqno) {
//       console.log("Message #%d", seqno)
//       var prefix = "(#" + seqno + ") "
//       msg.on("body", function (stream, info) {
//         var buffer = ""
//         stream.on("data", function (chunk) {
//           buffer += chunk.toString("utf8")
//         })
//         stream.once("end", function () {
//           console.log(
//             prefix + "Parsed header: %s",
//             inspect(Imap.parseHeader(buffer))
//           )
//         })
//       })
//       msg.once("attributes", function (attrs) {
//         console.log(prefix + "Attributes: %s", inspect(attrs, false, 8))
//       })
//       msg.once("end", function () {
//         console.log(prefix + "Finished")
//       })
//     })
//     f.once("error", function (err) {
//       console.log("Fetch error: " + err)
//     })
//     f.once("end", function () {
//       console.log("Done fetching all messages!")
//       imap.end()
//     })
//   })
// })

// imap.once("error", function (err) {
//   console.log(err)
// })

// imap.once("end", function () {
//   console.log("Connection ended")
// })

// imap.connect()
