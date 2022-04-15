import express from 'express'
import cors from 'cors'
import sql from 'mysql2'
import bcrypt from 'bcrypt'
import fetch from 'node-fetch'

const DISCORD_URL = 'https://discord.com/api/webhooks/960220822113509386/k-oVT_q2AcxPy9j6L0Pdjk8tuVdttX6YG5Sg40NGrwI33KBzHDmBgQB5OW3A-THi28V1'

const app = express()

app.use(express.json())
app.use(cors())

const port = process.env.PORT || 3001

const db = sql.createConnection({
    host: 'https://pma.ct8.pl',
    user: 'm27807_emcpanel',
    password: 'Emcpanel1!',
    database: 'm27807_emcpanel'
})

app.post('/api/auth/login', (req, res) => {
    const username = req.body.username
    const password = req.body.password
    const selectUser = `SELECT * FROM accounts WHERE username='${username}'`
    try {
        db.query(
            selectUser, (err, results, fields) => {
                if(results.length > 0) {
                    bcrypt.compare(password, results[0].password, (err, result) => {
                        if(err) {
                            console.log(err)
                            return
                        }
                        if(result == true) {
                            //console.log(results)
                            res.send({ status: 'success', msg: results[0].id})
                        } else {
                            //console.log('Niepoprawne dane')
                            res.send({ status: 'passErr', msg: 'Incorrect password' })
                        }
                    })
                } else {
                    //console.log('Nie ma takiego')
                }
            }
        )
    } catch (error) {
        console.log(error)
        res.send()
    }
})

app.post('/api/auth/register', async (req, res) => {
    const username = req.body.username
    const password = req.body.password
    const discord = req.body.discord
    // Prevent same username
        const selectUser = `SELECT * FROM accounts WHERE username='${username}'`
        try {
            db.query(
                selectUser, (err, results, fields) => {
                    if(results.length > 0) {
                        res.status(500)
                        res.send(`Podana nazwa użytkownika jest już zajęta`)
                    } else {
                        bcrypt.hash(password, 10, (err, hash) => {
                            const createUser = `INSERT INTO accounts(id, username, password, discord, rankid) VALUES('${Math.floor(Math.random() * 1000000)}', '${username}', '${hash}', '${discord}', 1)`
                            try {
                                db.query(
                                    createUser, (err, results, fields) => {
                                        res.send({ status: 'added', msg: 'Poprawnie utworzono konto! Możesz się teraz zalogować' })
                                            /* const params = {
                                                username: "Nowy pacjent",
                                                avatar_url: "https://scontent-waw1-1.xx.fbcdn.net/v/t1.15752-9/277593358_1608976449501038_2387522961415592653_n.png?_nc_cat=104&ccb=1-5&_nc_sid=ae9488&_nc_ohc=C6r1aQ-RHdkAX8dnx0j&_nc_ht=scontent-waw1-1.xx&oh=03_AVLFqVHhSM40AhgIkeMyKcQmVgaAo6RfWpv1vJ8rQ1VWsA&oe=626EFA2B",
                                                content: `<@&872782450143686657>`,
                                                embeds: [
                                                    {
                                                        "title": "Dane pacjenta",
                                                        "color": 0x00ff00,
                                                        "fields": [
                                                            {
                                                                "name": `Nick OOC - ${username}`,
                                                                "value": "Za niedługo będzie kogo kroić z kasy",
                                                                "inline": true
                                                            }
                                                        ]
                                                    }
                                                ]
                                            }
                                            fetch(DISCORD_URL, {
                                                method: "POST",
                                                headers: {
                                                    'Content-type': 'application/json'
                                                },
                                                body: JSON.stringify(params)
                                            }).then(res => {
                                                //console.log(res);
                                            })  */
                                    }
                                )
                            } catch (error) {
                                console.log(error)
                                res.send()
                            }
                        })
                    }
                }   
            )
        } catch (error) {
            console.log(error)
            res.send()
        }
})

app.get('/api/user/info', (req, res) => {
    const selectUser = `SELECT a.id, a.username, a.discord, a.birthdate, a.admin, a.doctor, r.name rname, r.color rcolor, r.privLevel as rpriv, a.firstName, a.lastName FROM accounts a JOIN ranks r on a.rankid = r.id ORDER BY firstName`
    try {
        db.query(
            selectUser, (err, results, fields) => {
                if(results) {
                    res.send(results)
                }                
            }
        )
    } catch (error) {
        console.log(error)
        res.send()
    }
})

app.get('/api/records/get', (req, res) => {
    const selectVisits = `SELECT a.id, a.username, a.discord, a.birthdate, a.doctor, a.firstName, ra.name rname, a.lastName, r.insurance, r.phone FROM accounts a JOIN record r on a.id = r.accID JOIN ranks ra ON ra.id = a.rankid ORDER BY firstName`
    db.query(
        selectVisits, (err, results, fields) => {
            res.send(results)
        }
    )
})

app.post('/api/visits/add', (req, res) => {
    const addVisit = `INSERT INTO visits(firstName, lastName, age, cel, date, accID) VALUES('${req.body.formData.firstName}', '${req.body.formData.lastName}', ${req.body.formData.age}, '${req.body.formData.cel}', '${req.body.formData.date}', ${req.body.accID})`
    try {
        db.query(
            addVisit, (err, results, fields) => {
                console.log('visit added')
                /* const params = {
                    username: "Nowa wizyta",
                    avatar_url: "https://scontent-waw1-1.xx.fbcdn.net/v/t1.15752-9/277593358_1608976449501038_2387522961415592653_n.png?_nc_cat=104&ccb=1-5&_nc_sid=ae9488&_nc_ohc=C6r1aQ-RHdkAX8dnx0j&_nc_ht=scontent-waw1-1.xx&oh=03_AVLFqVHhSM40AhgIkeMyKcQmVgaAo6RfWpv1vJ8rQ1VWsA&oe=626EFA2B",
                    content: `Zarejestrowano nową wizytę:\nImię: ${req.body.formData.firstName}\nNazwisko: ${req.body.formData.lastName}\nData: ${req.body.formData.date}`
                }
                fetch(DISCORD_URL, {
                    method: "POST",
                    headers: {
                        'Content-type': 'application/json'
                    },
                    body: JSON.stringify(params)
                }).then(res => {
                    //console.log(res);
                }) */
            }
        )
    } catch (error) {
        console.log(error)
    }
})


app.post('/api/records/add', (req, res) => {
    const addRecord = `INSERT INTO record(accID, insurance, phone) VALUES(${req.body.accID}, ${req.body.insurance}, '${req.body.phone}')`
    console.log(addRecord)
    try {
        db.query(
            addRecord, (err, results, fields) => {
                console.log(`record added`)
                /* const params = {
                    username: "Nowa kartoteka",
                    avatar_url: "https://scontent-waw1-1.xx.fbcdn.net/v/t1.15752-9/277593358_1608976449501038_2387522961415592653_n.png?_nc_cat=104&ccb=1-5&_nc_sid=ae9488&_nc_ohc=C6r1aQ-RHdkAX8dnx0j&_nc_ht=scontent-waw1-1.xx&oh=03_AVLFqVHhSM40AhgIkeMyKcQmVgaAo6RfWpv1vJ8rQ1VWsA&oe=626EFA2B",
                    content: `Nowa kartoteka pacjenta`
                }
                fetch(DISCORD_URL, {
                    method: "POST",
                    headers: {
                        'Content-type': 'application/json'
                    },
                    body: JSON.stringify(params)
                }).then(res => {
                    //console.log(res);
                }) */
            }
        )
    } catch (error) {
        console.log(error)
    }
})

app.post('/api/records/modify', (req, res) => {
    const oldData = req.body.content
    const newData = req.body.newContent
    const modifyAccount = `UPDATE accounts set firstName='${newData.firstName}', lastName='${newData.lastName}', birthdate='${newData.birthdate}' WHERE id=${oldData.id}`
    const modifyRecord = `UPDATE record set insurance=${newData.insurance}, phone='${newData.phone}' WHERE accID=${oldData.id} `
    try {
        db.query(
            modifyRecord, (err, results, fields) => {
                try {
                    db.query(
                        modifyAccount, (err, results, fields) => {

                        }
                    )
                } catch (error) {
                    console.log(error)
                }
            }
        )
    } catch (error) {
        console.log(error)
    }
})

app.post('/api/user/modify'), (req, res) => {
    console.log(req.body)
}

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})