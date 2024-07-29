const express = require('express');
const mysql = require('mysql2');
const app = express();
const port = 3000;

// Middleware to parse incoming request bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// MySQL connection for user_info database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Republic_C207',
  database: 'user_info'
});

// MySQL connection for bank_database
const bankConnection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Republic_C207',
  database: 'bank_database'
});

// Function to parse cookies
function parseCookies(cookieString) {
  return cookieString.split(';').reduce((cookies, cookie) => {
    const [name, value] = cookie.trim().split('=').map(c => decodeURIComponent(c));
    cookies[name] = value;
    return cookies;
  }, {});
}


// Middleware to handle cookies manually
app.use((req, res, next) => {
  const cookies = parseCookies(req.headers.cookie || '');
  req.cookies = cookies;
  next();
});

// Set up view engine and static files
app.set('view engine', 'ejs');
app.use(express.static('public'));

// Route to render the index page
app.get('/', (req, res) => {
  res.render('index');
});

// Route to render the signup page
app.get('/signup', (req, res) => {
  res.render('signup');
});

// Route to handle user signup
app.post('/signup', (req, res) => {
  const { username, email, password } = req.body;
  const INSERT_USER_QUERY = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';

  connection.query(INSERT_USER_QUERY, [username, email, password], (error, results) => {
    if (error) {
      console.error('Error inserting user:', error);
      return res.status(500).send('Error inserting user');
    }

    const userId = results.insertId;
    const walletNumber = `${password}${userId}`;

    // Insert the wallet with the generated wallet number
    const INSERT_WALLET_QUERY = 'INSERT INTO wallets (user_id, wallet_number, amount) VALUES (?, ?, ?)';
    connection.query(INSERT_WALLET_QUERY, [userId, walletNumber, 0], (error) => {
      if (error) {
        console.error('Error creating wallet:', error);
        return res.status(500).send('Error creating wallet');
      }

      console.log('User signed up successfully');
      res.redirect('/login');
    });
  });
});

// Route to render the login page
app.get('/login', (req, res) => {
  res.render('login');
});

// Route to handle user login
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const SELECT_USER_QUERY = 'SELECT * FROM users WHERE email = ? AND password = ?';

  connection.query(SELECT_USER_QUERY, [email, password], (error, results) => {
    if (error) {
      console.error('Error retrieving user:', error);
      return res.status(500).send('Error retrieving user');
    }

    if (results.length === 0) {
      return res.status(401).render('login', { error: 'Email or password incorrect' });
    }

    console.log('User logged in successfully');
    const userId = results[0].id;

    res.cookie('userId', userId, { httpOnly: true });

    // Redirect to the wallet page on successful login
    res.redirect('/wallet');
  });
});

// Route to render the wallet page
app.get('/wallet', (req, res) => {
  const userId = req.cookies.userId;

  if (!userId) {
    return res.status(401).send('User not logged in');
  }

  const SELECT_WALLET_QUERY = 'SELECT amount, wallet_number FROM wallets WHERE user_id = ?';
  connection.query(SELECT_WALLET_QUERY, [userId], (error, results) => {
    if (error) {
      console.error('Error retrieving wallet balance:', error);
      return res.status(500).send('Error retrieving wallet balance');
    }

    const balance = results.length > 0 ? results[0].amount : 0;
    const walletNumber = results.length > 0 ? results[0].wallet_number : '';
    res.render('wallet', { balance, walletNumber });
  });
});

// Route to render the top-up form
app.get('/topup', (req, res) => {
  res.render('topup');
});

// Handle top-up form submission
app.post('/topup', (req, res) => {
  const { cardNumber, cvv, amount } = req.body;
  const userId = req.cookies.userId;

  if (!userId) {
    return res.status(401).send('User not logged in');
  }

  // Query to check if the credit card exists and the cvv is correct
  const SELECT_CARD_QUERY = 'SELECT balance FROM credit_cards WHERE card_number = ? AND cvv = ?';

  bankConnection.query(SELECT_CARD_QUERY, [cardNumber, cvv], (error, results) => {
    if (error) {
      console.error('Error retrieving card information:', error);
      return res.status(500).send('Error retrieving card information');
    }

    if (results.length === 0) {
      return res.status(400).send('Invalid card number or CVV');
    }

    const cardBalance = results[0].balance;

    // Update the credit card balance
    const UPDATE_CARD_BALANCE_QUERY = 'UPDATE credit_cards SET balance = balance - ? WHERE card_number = ?';
    bankConnection.query(UPDATE_CARD_BALANCE_QUERY, [amount, cardNumber], (error) => {
      if (error) {
        console.error('Error updating card balance:', error);
        return res.status(500).send('Error updating card balance');
      }

      // Update the user's wallet balance
      const UPDATE_WALLET_QUERY = 'UPDATE wallets SET amount = amount + ? WHERE user_id = ?';
      connection.query(UPDATE_WALLET_QUERY, [amount, userId], (error) => {
        if (error) {
          console.error('Error updating wallet balance:', error);
          return res.status(500).send('Error updating wallet balance');
        }

        res.redirect('/wallet'); // Redirect to wallet page on success
      });
    });
  });
});

app.get('/staff', (req, res) => {
  const staffId = req.cookies.staffId;

  if (!staffId) {
    return res.status(401).send('Staff not logged in');
  }

  const SELECT_STAFF_QUERY = 'SELECT * FROM staff';
  connection.query(SELECT_STAFF_QUERY, (error, staffResults) => {
    if (error) {
      console.error('Error retrieving staff:', error);
      return res.status(500).send('Error retrieving staff');
    }

    const SELECT_USERS_QUERY = 'SELECT * FROM users';
    connection.query(SELECT_USERS_QUERY, (error, userResults) => {
      if (error) {
        console.error('Error retrieving users:', error);
        return res.status(500).send('Error retrieving users');
      }

      res.render('staff', { staff: staffResults, users: userResults });
    });
  });
});

// Route to handle updating a staff member
app.post('/update-staff', (req, res) => {
  const { username, newUsername, newEmail } = req.body;

  const UPDATE_STAFF_QUERY = 'UPDATE staff SET username = ?, email = ? WHERE username = ?';
  connection.query(UPDATE_STAFF_QUERY, [newUsername, newEmail, username], (error, results) => {
    if (error) {
      console.error('Error updating staff member:', error);
      return res.status(500).send('Error updating staff member');
    }

    console.log('Staff member updated successfully');
    res.redirect('/staff');
  });
});

// Existing route to handle updating a user
app.post('/update-user', (req, res) => {
  const { userId, newUsername, newEmail } = req.body;

  const UPDATE_USER_QUERY = 'UPDATE users SET username = ?, email = ? WHERE id = ?';
  connection.query(UPDATE_USER_QUERY, [newUsername, newEmail, userId], (error, results) => {
    if (error) {
      console.error('Error updating user:', error);
      return res.status(500).send('Error updating user');
    }

    console.log('User updated successfully');
    res.redirect('/staff');
  });
});


// Route to handle deleting a user by username
app.post('/delete-user', (req, res) => {
  const { username, userType } = req.body;
  let DELETE_QUERY;

  if (userType === 'staff') {
      DELETE_QUERY = 'DELETE FROM staff WHERE username = ?';
  } else if (userType === 'user') {
      DELETE_QUERY = 'DELETE FROM users WHERE username = ?';
  }

  connection.query(DELETE_QUERY, [username], (error, results) => {
      if (error) {
          console.error('Error deleting user:', error);
          return res.status(500).send('Error deleting user');
      }

      console.log('User deleted successfully');
      res.redirect('/staff'); // Redirect to appropriate page after deletion
  });
});

// Route to handle adding a staff member
app.post('/add-staff', (req, res) => {
  const { staffUsername, staffEmail, staffPassword } = req.body;
  
  // Insert logic to add staff member to database
  const INSERT_STAFF_QUERY = 'INSERT INTO staff (username, email, password) VALUES (?, ?, ?)';
  connection.query(INSERT_STAFF_QUERY, [staffUsername, staffEmail, staffPassword], (error, results) => {
      if (error) {
          console.error('Error adding staff member:', error);
          return res.status(500).send('Error adding staff member');
      }

      console.log('Staff member added successfully');
      res.redirect('/staff'); // Redirect to staff management page
  });
});

// Route to handle transactions
app.get('/transactions', (req, res) => {
  const userId = req.cookies.userId;

  // Query to retrieve transactions for the user
  const SELECT_TRANSACTIONS_QUERY = 'SELECT * FROM transactions WHERE user_id = ?';

  connection.query(SELECT_TRANSACTIONS_QUERY, [userId], (error, results) => {
    if (error) {
      console.error('Error retrieving transactions:', error);
      return res.status(500).send('Error retrieving transactions');
    }

    // Render transactions.ejs with transactions data
    res.render('transactions', { transactions: results });
  });
});

// Handle transfer form submission
app.post('/transfer', (req, res) => {
  const { password, toWalletNumber, amount } = req.body;
  const userId = req.cookies.userId;

  if (!userId) {
    return res.status(401).send('User not logged in');
  }

  // Validate the user's password
  const SELECT_USER_QUERY = 'SELECT * FROM users WHERE id = ? AND password = ?';
  connection.query(SELECT_USER_QUERY, [userId, password], (error, userResults) => {
    if (error) {
      console.error('Error validating user:', error);
      return res.status(500).send('Error validating user');
    }

    if (userResults.length === 0) {
      return res.status(401).send('Invalid password');
    }

// Check if the recipient's wallet exists
const SELECT_RECIPIENT_WALLET_QUERY = 'SELECT * FROM wallets WHERE wallet_number = ?';
connection.query(SELECT_RECIPIENT_WALLET_QUERY, [toWalletNumber], (error, recipientResults) => {
  if (error) {
    console.error('Error retrieving recipient wallet:', error);
    return res.status(500).send('Error retrieving recipient wallet');
  }

  if (recipientResults.length === 0) {
    return res.status(404).send('Recipient wallet not found');
  }

  // Get sender's wallet balance
  const SELECT_SENDER_WALLET_QUERY = 'SELECT amount FROM wallets WHERE user_id = ?';
  connection.query(SELECT_SENDER_WALLET_QUERY, [userId], (error, senderResults) => {
    if (error) {
      console.error('Error retrieving sender wallet:', error);
      return res.status(500).send('Error retrieving sender wallet');
    }

    const senderWallet = senderResults[0];
    if (senderWallet.amount <= 0 || senderWallet.amount < amount) {
      return res.status(400).send('Insufficient balance in wallet');
    }

    // Start transaction
    connection.beginTransaction((err) => {
      if (err) {
        console.error('Error starting transaction:', err);
        return res.status(500).send('Error starting transaction');
      }

      // Deduct amount from sender's wallet
      const DEDUCT_SENDER_QUERY = 'UPDATE wallets SET amount = amount - ? WHERE user_id = ?';
      connection.query(DEDUCT_SENDER_QUERY, [amount, userId], (error) => {
        if (error) {
          return connection.rollback(() => {
            console.error('Error deducting from sender wallet:', error);
            res.status(500).send('Error deducting from sender wallet');
          });
        }

        // Add amount to recipient's wallet
        const recipientUserId = recipientResults[0].user_id;
        const ADD_RECIPIENT_QUERY = 'UPDATE wallets SET amount = amount + ? WHERE user_id = ?';
        connection.query(ADD_RECIPIENT_QUERY, [amount, recipientUserId], (error) => {
          if (error) {
            return connection.rollback(() => {
              console.error('Error adding to recipient wallet:', error);
              res.status(500).send('Error adding to recipient wallet');
            });
          }

          // Record transaction for sender
          const RECORD_TRANSACTION_QUERY = 'INSERT INTO transactions (user_id, amount, description) VALUES (?, ?, ?)';
          connection.query(RECORD_TRANSACTION_QUERY, [userId, -amount, 'Transfer'], (error) => {
            if (error) {
              return connection.rollback(() => {
                console.error('Error recording sender transaction:', error);
                res.status(500).send('Error recording sender transaction');
              });
            }

            // Record transaction for recipient
            connection.query(RECORD_TRANSACTION_QUERY, [recipientUserId, amount, 'Transfer'], (error) => {
              if (error) {
                return connection.rollback(() => {
                  console.error('Error recording recipient transaction:', error);
                  res.status(500).send('Error recording recipient transaction');
                });
              }

              // Commit transaction
              connection.commit((err) => {
                if (err) {
                  return connection.rollback(() => {
                    console.error('Error committing transaction:', err);
                    res.status(500).send('Error committing transaction');
                  });
                }

                res.redirect('/wallet'); // Redirect to wallet page on success
              });
            });
          });
        });
      });
    });
  });
});
});
});

// Route to handle deleting a transaction
app.post('/transactions/:id', (req, res) => {
  const transactionId = req.params.id;

  const DELETE_TRANSACTION_QUERY = 'DELETE FROM transactions WHERE id = ?';
  connection.query(DELETE_TRANSACTION_QUERY, [transactionId], (error, results) => {
    if (error) {
      console.error('Error deleting transaction:', error);
      return res.status(500).send('Error deleting transaction');
    }

    res.redirect('/transactions');
  });
});

// Route to render the contact page
app.get('/contact', (req, res) => {
  res.render('contact');
});

// Route to render the services page
app.get('/services', (req, res) => {
  res.render('services');
});

// Route to render the staff login page
app.get('/stafflogin', (req, res) => {
  res.render('stafflogin');
});

// Route to render the transfer page
app.get('/transfer', (req, res) => {
  res.render('transfer'); 
});

// Route to handle staff login
app.post('/stafflogin', (req, res) => {
  const { email, password } = req.body;
  const SELECT_STAFF_QUERY = 'SELECT * FROM staff WHERE email = ? AND password = ?';

  connection.query(SELECT_STAFF_QUERY, [email, password], (error, results) => {
    if (error) {
      console.error('Error retrieving staff:', error);
      return res.status(500).send('Error retrieving staff');
    }

    if (results.length === 0) {
      return res.status(401).render('stafflogin', { error: 'Email or password incorrect' });
    }

    console.log('Staff logged in successfully');
    const staffId = results[0].id;

    res.cookie('staffId', staffId, { httpOnly: true });

    // Redirect to the staff management page on successful login
    res.redirect('/staff');
  });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
