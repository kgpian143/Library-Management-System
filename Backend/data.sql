CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    student_name VARCHAR(255) NOT NULL,
    father_name VARCHAR(255),
    mobile_number VARCHAR(15),
    gender VARCHAR(10),
    address TEXT,
    aadhar_number VARCHAR(20),
    profile_photo BYTEA, 
    status BOOLEAN,
);


CREATE TABLE shifts (
    shift_id SERIAL PRIMARY KEY,
    shift_time VARCHAR(10) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    is_full_day_shift BOOLEAN NOT NULL
);


CREATE TABLE seat (
    seat_id SERIAL PRIMARY KEY,
    seat_no VARCHAR(20) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    seat_type VARCHAR(50) NOT NULL
);

CREATE TABLE seat_allocation (
    allocation_id SERIAL PRIMARY KEY,
    student_id INT REFERENCES students(id) NOT NULL,
    shift_id INT REFERENCES shifts(shift_id) NOT NULL,
    seat_id INT REFERENCES seat(seat_id) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    payment_status VARCHAR(20) NOT NULL,
    payment_mode VARCHAR(20),
    paid_amount NUMERIC(10, 2),
    total_amount NUMERIC(10, 2),
    due_amount NUMERIC(10, 2)
);


CREATE TABLE expense (
    expense_id SERIAL PRIMARY KEY,
    amount NUMERIC(10, 2) NOT NULL,
    expense_date DATE NOT NULL,
    payment_mode VARCHAR(20),
    remark TEXT
);
