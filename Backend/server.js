// server.js
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const multer = require('multer')


const app = express();
const port = 5000; // Choose a port number
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'mylib',
    password: 'dakshana',
    port: 5432,
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.use(cors());

// Middleware
app.use(express.json());

// Routes
app.get('/get-expenses', (req, res) => {
    pool.query('SELECT * FROM expense', (error, result) => {
        if (error) throw error;

        res.status(200).json(result.rows);
    });
});

// table creation queries
// CREATE TABLE students(
//     id SERIAL PRIMARY KEY,
//     student_name VARCHAR(255) NOT NULL,
//     roll_number VARCHAR(20) NOT NULL,
//     father_name VARCHAR(255),
//     mobile_number VARCHAR(15),
//     mobile_number2 VARCHAR(15),
//     gender VARCHAR(10),
//     address TEXT,
//     aadhar_number VARCHAR(20),
//     profile_photo BYTEA, --Assuming you're storing the image as binary data
//     status VARCHAR(20)
// );


// CREATE TABLE shifts(
//     shift_id SERIAL PRIMARY KEY,
//     shift_time VARCHAR(10) NOT NULL,
//     amount NUMERIC(10, 2) NOT NULL,
//     is_full_day_shift BOOLEAN NOT NULL
// );


// CREATE TABLE seat(
//     seat_id SERIAL PRIMARY KEY,
//     seat_no VARCHAR(20) NOT NULL,
//     seat_type VARCHAR(50) NOT NULL
// );

// CREATE TABLE seat_allocation(
//     allocation_id SERIAL PRIMARY KEY,
//     student_id INT REFERENCES students(id) NOT NULL,
//     shift_id INT REFERENCES shifts(shift_id) NOT NULL,
//     start_date DATE NOT NULL,
//     end_date DATE NOT NULL,
//     payment_status VARCHAR(20) NOT NULL,
//     payment_mode VARCHAR(20),
//     paid_amount NUMERIC(10, 2),
//     discount NUMERIC(5, 2)
// );


// CREATE TABLE expense(
//     expense_id SERIAL PRIMARY KEY,
//     amount NUMERIC(10, 2) NOT NULL,
//     expense_date DATE NOT NULL,
//     payment_mode VARCHAR(20),
//     remark TEXT
// );

// CREATE TABLE payments(
//     payment_id SERIAL PRIMARY KEY,
//     student_id INT REFERENCES students(id) NOT NULL,
//     payment_mode VARCHAR(50) NOT NULL,
//     amount NUMERIC(10, 2) NOT NULL,
//     payment_date DATE NOT NULL
// );

app.get('/get-expense/:id', async (req, res) => {

    try {
        const { id } = req.params;
        console.log(id);
        pool.query('SELECT * FROM expense WHERE expense_id = $1', [id], (error, result) => {
            if (error) throw error;

            res.status(200).json(result.rows);
        });

    } catch (error) {
        console.error('Error getting expense:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }

})
app.post('/add-expense', upload.single('amount'), async (req, res) => {
    try {
        const { Amount, PostedDate, PaymentMode, Remark } = req.body;

        // Debugging: Log the received data to the console
        console.log('req.body', req.body);

        // convert date into the format 
        const [day, month, year] = PostedDate.split('-');
        const formattedDate = `${year}-${month}-${day}`;
        // Add data to the database
        const result = await pool.query(
            'INSERT INTO expense (amount, expense_date, payment_mode, remark) VALUES ($1, $2, $3, $4) RETURNING *',
            [Amount, formattedDate, PaymentMode, Remark]
        );

        res.json({ success: true, expense: result.rows[0] });
    } catch (error) {
        console.error('Error adding expense:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }

});


app.put('/update-expense/:id', upload.single('amount'), (req, res) => {
    const { id } = req.params;
    const { Amount, PostedDate, PaymentMode, Remark } = req.body;
    console.log(req.body);

    pool.query(
        'UPDATE expense SET amount = $1, expense_date = $2, payment_mode = $3, remark = $4 WHERE expense_id = $5',
        [Amount, PostedDate, PaymentMode, Remark, id],
        (error, result) => {
            if (error) throw error;

            res.json({ success: true });
        }
    );
});

app.delete('/delete-expense/:id', (req, res) => {
    const { id } = req.params;

    pool.query('DELETE FROM expense WHERE expense_id = $1', [id], (error, result) => {
        if (error) throw error;

        res.json({ success: true });
    });
});

app.get('/get-students', (req, res) => {
    pool.query('SELECT * FROM students', (error, result) => {
        if (error) throw error;
        // const studentsWithBase64 = result.rows.map(student => {
        //     const base64Image = Buffer.from(student.profile_photo).toString('base64');
        //     return {
        //         ...student,
        //         profile_photo: `data:image/*;base64,${base64Image}`,
        //     };
        // });

        res.json(result.rows);
    });
});

// get available students 
app.get('/get-students-available', (req, res) => {
    // console.log("get students");
    pool.query('SELECT * FROM students WHERE status = $1', [false], (error, result) => {
        if (error) throw error;
        // const studentsWithBase64 = result.rows.map(student => {
        //     const base64Image = Buffer.from(student.profile_photo).toString('base64');
        //     return {
        //         ...student,
        //         profile_photo: `data:image/*;base64,${base64Image}`,
        //     };
        // });

        res.json(result.rows);
    });
});

app.get('/get-student/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(id);
        pool.query('SELECT * FROM students WHERE id = $1', [id], (error, result) => {
            if (error) throw error;
            // const studentsWithBase64 = result.rows.map(student => {
            //     const base64Image = Buffer.from(student.profile_photo).toString('base64');
            //     return {
            //         ...student,
            //         profile_photo: `data:image/*;base64,${base64Image}`,
            //     };
            // });

            res.json(result.rows);
        });
    } catch (error) {
        console.error('Error getting expense:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

app.post('/add-student', upload.single('student_name'), (req, res) => {
    const { Name, FatherName, MobileNo, Gender, Address, AadharCardNo } = req.body;
    // const ProfilePhoto = req.file.buffer;

    // add to db
    pool.query(
        'INSERT INTO students (student_name, father_name, mobile_number, gender, address, aadhar_number, status) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [Name, FatherName, MobileNo, Gender, Address, AadharCardNo, false],
        (error, result) => {
            if (error) {
                console.error('Error adding student:', error);
                res.status(500).json({ success: false, error: 'Internal Server Error' });
            } else {
                res.json({ success: true });
            }
        }
    );
});


app.put('/update-student/:id', (req, res) => {
    const { id } = req.params;
    const { Name, FatherName, MobileNo, Gender, Address, AadharCardNo, Status } = req.body;

    pool.query(
        'UPDATE students SET student_name = $1, father_name = $2, mobile_number = $3 , gender = $4 , address = $5 , aadhar_number = $6 , status = $7 WHERE id = $8',
        [Name, FatherName, MobileNo, Gender, Address, AadharCardNo, Status, id],
        (error, result) => {
            if (error) throw error;

            res.json({ success: true });
        }
    );
});


app.delete('/delete-student/:id', (req, res) => {
    const { id } = req.params;

    pool.query('DELETE FROM students WHERE id = $1', [id], (error, result) => {
        if (error) throw error;

        res.json({ success: true });
    });
});

app.get('/get-shifts', (req, res) => {
    pool.query('SELECT * FROM shifts', (error, result) => {
        if (error) throw error;

        res.status(200).json(result.rows);
    });
});

app.post('/add-shift', upload.single('shift_time'), (req, res) => {
    console.log(req.body);
    const { Shift, Amount, IsFullDay } = req.body;
    // add to db
    pool.query(
        'INSERT INTO shifts (shift_time, amount, is_full_day_shift) VALUES ($1, $2, $3)',
        [Shift, Amount, IsFullDay],
        (error, result) => {
            if (error) throw error;

            res.json({ success: true });
        }
    );
});

app.get('/get-shift/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(id);
        pool.query('SELECT * FROM shifts WHERE shift_id = $1', [id], (error, result) => {
            if (error) throw error;

            res.status(200).json(result.rows);
        });

    } catch (error) {
        console.error('Error getting shift:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.put('/update-shift/:id', upload.single("shift_time"), (req, res) => {
    const { id } = req.params;
    const { Shift, Amount, IsFullDay } = req.body;

    pool.query(
        'UPDATE shifts SET shift_time = $1, amount = $2, is_full_day_shift = $3 WHERE shift_id = $4',
        [Shift, Amount, IsFullDay, id],
        (error, result) => {
            if (error) throw error;

            res.json({ success: true });
        }
    );
});

app.delete('/delete-shift/:id', (req, res) => {
    const { id } = req.params;

    pool.query('DELETE FROM shifts WHERE shift_id = $1', [id], (error, result) => {
        if (error) throw error;

        res.json({ success: true });
    });
});

app.get('/get-seats', (req, res) => {
    console.log("get seats");
    pool.query('SELECT * FROM seat', (error, result) => {
        if (error) throw error;

        res.status(200).json(result.rows);
    });
});

// get seats with status = NO
app.get('/get-seats-available', (req, res) => {
    pool.query('SELECT * FROM seat WHERE booking_status = $1', ["NO"], (error, result) => {
        if (error) throw error;

        res.status(200).json(result.rows);
    });
});

// get seat with specific id 
app.get('/get-seat/:id', async (req, res) => {
    const id = req.params.id;
    console.log(id);
    pool.query('SELECT * FROM seat WHERE seat_id = $1', [id], (error, result) => {
        if (error) throw error;

        res.status(200).json(result.rows);
    });
});

app.post('/add-seat', upload.single('seat_no'), (req, res) => {
    const { SeatNo, SeatType } = req.body;
    // add to db
    pool.query(
        'INSERT INTO seat (seat_no, seat_type , booking_status) VALUES ($1, $2 , $3)',
        [SeatNo, SeatType, "NO"],
        (error, result) => {
            if (error) throw error;

            res.json({ success: true });
        }
    );
});

app.put('/update-seat/:id', upload.single('seat_no'), (req, res) => {
    const { id } = req.params;
    const { SeatNo, SeatType } = req.body;

    pool.query(
        'UPDATE seat SET seat_no = $1, seat_type = $2 WHERE seat_id = $3',
        [SeatNo, SeatType, id],
        (error, result) => {
            if (error) throw error;

            res.json({ success: true });
        }
    );
});

app.delete('/delete-seat/:id', (req, res) => {
    const { id } = req.params;

    pool.query('DELETE FROM seat WHERE seat_id = $1', [id], (error, result) => {
        if (error) throw error;

        res.json({ success: true });
    });
});

app.get('/get-seat-allocations', (req, res) => {
    // get profile photo , student name , mobilenumber , seat no , shift time , start date , end date , payment status , payment mode , paid amount , discount using inner join 
    pool.query('SELECT seat_allocation.allocation_id as id , students.profile_photo as profile_photo , students.student_name as student_name , students.mobile_number as mobile_number , seat.seat_no as seat_no , shifts.shift_time as shift_time , seat_allocation.total_amount as total_amount , seat_allocation.start_date as start_date , seat_allocation.end_date as end_date,  seat_allocation.paid_amount as paid_amount, seat_allocation.due_amount as due_amount  FROM seat_allocation INNER JOIN students ON seat_allocation.student_id = students.id INNER JOIN seat ON seat_allocation.seat_id = seat.seat_id INNER JOIN shifts ON seat_allocation.shift_id = shifts.shift_id', (error, result) => {
        if (error) throw error;

        res.status(200).json(result.rows);
    });

});

app.get('/get-seat-allocations-forshift', (req, res) => {
    const { shift_id } = req.body;
    pool.query('SELECT * FROM seat_allocation WHERE shift_id = $1', [shift_id], (error, result) => {
        if (error) throw error;

        res.status(200).json(result.rows);
    });
});

app.post('/add-seat-allocation', upload.single('payment_status'), (req, res) => {

    const { SeatId, StudentId, ShiftId, StartDate, EndDate, PaymentStatus, PaymentMode, PaidAmount, Discount, totalamount } = req.body;
    console.log(totalamount);
    const dueamount = totalamount - PaidAmount;
    // add to db

    // update student status
    pool.query(
        'UPDATE students SET status = $1 WHERE id = $2',
        ["YES", StudentId],
        (error, result) => {
            if (error) throw error;

            // res.json({ success: true });
        }
    );

    // update seat status
    pool.query(
        'UPDATE seat SET booking_status = $1 WHERE seat_id = $2',
        ["YES", SeatId],
        (error, result) => {
            if (error) throw error;

            // res.json({ success: true });
        }
    );

    // add payment details

    pool.query(
        'INSERT INTO payments (payment_mode, amount, payment_date , student_id ) VALUES ($1, $2, $3 , $4)',
        [PaymentMode, PaidAmount, StartDate , StudentId],
        (error, result) => {
            if (error) throw error;

            // res.json({ success: true });
        }
    );

    pool.query(
        'INSERT INTO seat_allocation (student_id, shift_id, start_date, end_date, payment_status, payment_mode, paid_amount, discount , seat_id , total_amount , due_amount ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8 , $9 , $10 , $11 )',
        [StudentId, ShiftId, StartDate, EndDate, PaymentStatus, PaymentMode, PaidAmount, Discount, SeatId, totalamount, dueamount],
        (error, result) => {
            if (error) throw error;

            res.json({ success: true });
        }
    );
});

app.put('/update-seat-allocation/:id', (req, res) => {
    const { id } = req.params;
    const { StudentId, ShiftId, StartDate, EndDate, PaymentStatus, PaymentMode, PaidAmount, Discount } = req.body;

    pool.query(
        'UPDATE seat_allocation SET student_id = $1, shift_id = $2, start_date = $3, end_date = $4, payment_status = $5, payment_mode = $6, paid_amount = $7, discount = $8 WHERE allocation_id = $9',
        [StudentId, ShiftId, StartDate, EndDate, PaymentStatus, PaymentMode, PaidAmount, Discount, id],
        (error, result) => {
            if (error) throw error;

            res.status(200).send(`Seat Allocation modified with ID: ${id}`);
        }
    );
});

// update fee details in seat allocation table
app.put('/update-seat-allocation-fee/:id', upload.single('due_amount') , (req, res) => {
    const { id } = req.params;
    const { PaidAmount, PostedDate, PaymentMode } = req.body;
    console.log(id);

    // get total amount and due amount from seat allocation table
    pool.query('SELECT total_amount , due_amount , paid_amount , student_id  FROM seat_allocation WHERE allocation_id = $1', [id], (error, result) => {
        if (error) throw error;
        const totalamount = result.rows[0].total_amount;
        const dueamount = result.rows[0].due_amount;
        const paidamount = result.rows[0].paid_amount  ;
        const student_id = result.rows[0].student_id;
        // insert payment details 

        const Amount = parseFloat(PaidAmount) + parseFloat(paidamount);
        console.log(Amount);
        pool.query(
            'INSERT INTO payments (payment_mode, amount, payment_date , student_id ) VALUES ($1, $2, $3 , $4)',
            [PaymentMode, PaidAmount , PostedDate , student_id],
            (error, result) => {
                if (error) throw error;

                // res.json({ success: true }); 
            }
        );
        
        // update seat allocation table
        pool.query(
            'UPDATE seat_allocation SET payment_status = $1, payment_mode = $2, paid_amount = $3, due_amount = $4 WHERE allocation_id = $5',
            ["PAID", PaymentMode, Amount  , dueamount - PaidAmount, id],
            (error, result) => {
                if (error) throw error;

                res.json({ success: true });
            }
        );
    });
});

app.delete('/delete-seat-allocation/:id', (req, res) => {
    const { id } = req.params;

    // change status of seat 
    pool.query('Update seat set booking_status = $1 where seat_id = (select seat_id from seat_allocation where allocation_id = $2)', ["NO", id], (error, result) => {
        if (error) throw error;

        // res.status(200).send(`Seat Allocation deleted with ID: ${id}`);
    });

    // change status of student
    pool.query('Update students set status = $1 where id = (select student_id from seat_allocation where allocation_id = $2)', [false, id], (error, result) => {
        if (error) throw error;

        // res.json({ success: true });
    });
    pool.query('DELETE FROM seat_allocation WHERE allocation_id = $1', [id], (error, result) => {
        if (error) throw error;

        res.json({ success: true });
    });
});


// get payment details with student name mobile number , date , amount and payment mode 

app.get('/get-payment-details', async (req, res) => {
    
    pool.query('SELECT payment_id , student_name , mobile_number , amount , payment_date , payment_mode from students inner join payments on payments.student_id = students.id ',(error, result) => {
        if(error) throw error;

        res.status(200).json(result.rows);
    });
});

// delete payment details

app.delete('/delete-payment-details/:id', (req, res) => {
    const { id } = req.params;

    pool.query('DELETE FROM payments WHERE payment_id = $1', [id], (error, result) => {
        if (error) throw error;

        res.json({ success: true });
    });
});





// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
