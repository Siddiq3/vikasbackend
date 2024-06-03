const express = require('express');
const router = express.Router();
const Admission = require('../models/addmission');
const Attendance = require('../models/attendence');
const FeePayment = require('../models/feepayment');
const StaffAttendance = require('../models/staffattendence');
const Staff = require('../models/staff');
const Fee = require('../models/busfee');
const Route = require('../models/busmager');
const Class = require('../models/class');

router.post('/classes', async (req, res) => {
    const { className, classFee, examFee, bookFee } = req.body;
  
    try {
      // Create a new instance of the Class model
      const newClass = new Class({
        className,
        classFee,
        examFee,
        bookFee
      });
  
      // Save the new class instance to the database
      const savedClass = await newClass.save();
  
      res.status(201).json(savedClass); // Respond with the saved class object
    } catch (error) {
      res.status(400).json({ message: error.message }); // Respond with an error if saving fails
    }
  });
  
  // GET route to retrieve all classes
router.get('/classes', async (req, res) => {
    try {
      const classes = await Class.find();
      res.json(classes);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
 // DELETE route to remove a class by ID
router.delete('/classes/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      // Find and delete the class by ID
      const deletedClass = await Class.findByIdAndDelete(id);
  
      if (!deletedClass) {
        return res.status(404).json({ message: 'Class not found' });
      }
  
      res.status(200).json({ message: 'Class deleted successfully' });
    } catch (error) {
      res.status(400).json({ message: error.message }); // Respond with an error if deletion fails
    }
  });
  
  // PUT route to update a class by ID
  router.put('/classes/:id', async (req, res) => {
    const { id } = req.params;
    const { className, classFee, examFee, bookFee } = req.body;
  
    try {
      // Find and update the class by ID
      const updatedClass = await Class.findByIdAndUpdate(
        id,
        { className, classFee, examFee, bookFee },
        { new: true, runValidators: true }
      );
  
      if (!updatedClass) {
        return res.status(404).json({ message: 'Class not found' });
      }
  
      res.status(200).json(updatedClass); // Respond with the updated class object
    } catch (error) {
      res.status(400).json({ message: error.message }); // Respond with an error if updating fails
    }
  });
  
// POST route to add admission
router.post('/admissionsform', async (req, res) => {
    try {
        const admission = new Admission(req.body);
        await admission.save();
        res.status(201).send(admission);
    } catch (error) {
        res.status(400).send(error);
    }
});

// GET route to fetch all admissions
router.get('/admissions', async (req, res) => {
    try {
        const admissions = await Admission.find();
        res.send(admissions);
    } catch (error) {
        res.status(500).send(error);
    }
});
// GET endpoint to fetch admission details by admission number
router.get('/admissions/:admissionNumber', async (req, res) => {
    try {
        const { admissionNumber } = req.params;
        const admission = await Admission.findOne({ admissionNumber });
        if (!admission) {
            return res.status(404).json({ message: 'Admission not found' });
        }
        res.json(admission);
    } catch (error) {
        console.error('Error fetching admission:', error);
        res.status(500).json({ message: 'Error fetching admission' });
    }
});

router.get('/students/:class/:section', async (req, res) => {
    try {
        const { class: className, section } = req.params;
        const students = await Admission.find({ class: className, section });
        res.json(students);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ message: 'Error fetching students' });
    }
});



router.post('/attendance', async (req, res) => {
    try {
        const { students } = req.body;
        // Loop through the students array and save each attendance record
        for (const student of students) {
            const attendanceRecord = new Attendance({
                admissionNumber: student.admissionNumber,
                date: new Date(), // Assuming current date
                present: student.present
            });
            await attendanceRecord.save();
        }
        res.json({ message: 'Attendance saved successfully' });
    } catch (error) {
        console.error('Error saving attendance:', error);
        res.status(500).json({ message: 'Error saving attendance' });
    }
});


router.get('/fees', async (req, res) => {
    try {
        const { class: className, section, admissionNumber, mobileNumber } = req.query;

        let query = {};
        if (className) query.class = className;
        if (section) query.section = section;
        if (admissionNumber) query.admissionNumber = admissionNumber;
        if (mobileNumber) query.phoneNumber = mobileNumber;

        const student = await Admission.findOne(query);
        const lastPayment = await FeePayment.findOne(query).sort({ date: -1 });

        if (!student || !lastPayment) {
            return res.status(404).json({ message: 'Student or payment record not found' });
        }

        const responseData = {
            student: {
                admissionNumber: student.admissionNumber,
                fullName: student.fullName,
                fatherName: student.fatherName,
                address: student.village,
                phoneNumber: student.phonenumber,
                className: student.className,
                section: student.section,
                rollNo: student.rollNumber,
                classFee: student.classFee,
                examFee: student.examFee,
                bookFee: student.bookFee,
                busFee: student.busFee,
                oldFee: student.oldFee,
                totalFee: lastPayment.totalFee,
                discount: student.discount,
                netFee: student.netFee,
                totalPaid: lastPayment.totalPaid,
                totalDueAmount: lastPayment.totalDueAmount,
               
            }
        };

        res.json(responseData);
    } catch (error) {
        console.error('Error fetching student fee information:', error);
        res.status(500).json({ message: 'Error fetching student fee information' });
    }
});




// POST route to handle fee payment
router.post('/payment', async (req, res) => {
    const { admissionNumber, classFeePaid, busFeePaid, bookFeePaid, examFeePaid, oldFeePaid, mode } = req.body;

    try {
        // Find the student by admission number
        const student = await Admission.findOne({ admissionNumber });
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Fetch the last payment record
        const lastPayment = await FeePayment.findOne({ admissionNumber }).sort({ date: -1 });

        // Initialize the totals from the last payment or set to zero if no previous payment exists
        const totalClassFeePaid = lastPayment ? lastPayment.classFeePaid : 0;
        const totalBusFeePaid = lastPayment ? lastPayment.busFeePaid : 0;
        const totalBookFeePaid = lastPayment ? lastPayment.bookFeePaid : 0;
        const totalExamFeePaid = lastPayment ? lastPayment.examFeePaid : 0;
        const totalOldFeePaid = lastPayment ? lastPayment.oldFeePaid : 0;

        // Validate and convert input values to numbers
        const newClassFeePaid = totalClassFeePaid + (Number(classFeePaid) || 0);
        const newBusFeePaid = totalBusFeePaid + (Number(busFeePaid) || 0);
        const newBookFeePaid = totalBookFeePaid + (Number(bookFeePaid) || 0);
        const newExamFeePaid = totalExamFeePaid + (Number(examFeePaid) || 0);
        const newOldFeePaid = totalOldFeePaid + (Number(oldFeePaid) || 0);

        // Calculate due amounts for each fee type
        const classFeeDue = student.classFee - newClassFeePaid;
        const busFeeDue = student.busFee - newBusFeePaid;
        const bookFeeDue = student.bookFee - newBookFeePaid;
        const examFeeDue = student.examFee - newExamFeePaid;
        const oldFeeDueAmount = student.oldFee - newOldFeePaid;

        // Calculate the total fee, total paid, and total due
        const totalFee = student.classFee + student.busFee + student.bookFee + student.examFee + student.oldFee;
        const totalPaid = newClassFeePaid + newBusFeePaid + newBookFeePaid + newExamFeePaid + newOldFeePaid;
        const totalDueAmount = student.netFee - totalPaid;

        // Create a new payment record with the updated amounts
        const newPayment = new FeePayment({
            admissionNumber,
            name: student.name,
            fatherName: student.fatherName,
            village: student.address,
            phoneNumber: student.phoneNumber,
            class: student.class,
            section: student.section,
            rollNo: student.rollNo,
            classFee: student.classFee,
            classFeePaid: newClassFeePaid,
            classFeeDue,
            examFee: student.examFee,
            examFeePaid: newExamFeePaid,
            examFeeDue,
            bookFee: student.bookFee,
            bookFeePaid: newBookFeePaid,
            bookFeeDue,
            busFee: student.busFee,
            busFeePaid: newBusFeePaid,
            busFeeDue,
            oldFee: student.oldFee,
            oldFeePaid: newOldFeePaid,
            oldFeeDueAmount,
            totalFee,
            discount: student.discount,
            netFee: student.netFee,
            totalPaid,
            totalDueAmount,
            mode,
            date: new Date()
        });

        await newPayment.save();

        res.status(201).json({ message: 'Payment successful!', payment: newPayment });
    } catch (error) {
        console.error('Error making payment:', error);
        res.status(500).json({ error: 'Error making payment. Please try again' });
    }
});


router.get('/payment-details/:admissionNumber', async (req, res) => {
    const admissionNumber = req.params.admissionNumber;

    try {
        // Find the student by admission number
        const student = await Admission.findOne({ admissionNumber });
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Fetch all payment records, sorted by date in descending order
        const payments = await FeePayment.find({ admissionNumber }).sort({ date: -1 });

        if (!payments || payments.length === 0) {
            return res.status(404).json({ message: 'No payment records found for the student' });
        }

        // Construct response with payment details and student information
        const paymentDetails = payments.map(payment => {
            let feePaid;
            let amountPaid = 0;

            if (payment.classFeePaid > (payment.classFeePaid - (Number(payment.classFeePaid) || 0))) {
                feePaid = 'Class Fee';
                amountPaid = Number(payment.classFeePaid);
            } else if (payment.busFeePaid > (payment.busFeePaid - (Number(payment.busFeePaid) || 0))) {
                feePaid = 'Bus Fee';
                amountPaid = Number(payment.busFeePaid);
            } else if (payment.bookFeePaid > (payment.bookFeePaid - (Number(payment.bookFeePaid) || 0))) {
                feePaid = 'Book Fee';
                amountPaid = Number(payment.bookFeePaid);
            } else if (payment.examFeePaid > (payment.examFeePaid - (Number(payment.examFeePaid) || 0))) {
                feePaid = 'Exam Fee';
                amountPaid = Number(payment.examFeePaid);
            } else if (payment.oldFeePaid > (payment.oldFeePaid - (Number(payment.oldFeePaid) || 0))) {
                feePaid = 'Old Fee';
                amountPaid = Number(payment.oldFeePaid);
            } else {
                feePaid = 'No fee paid';
            }

            return {
                date: payment.date,
                feePaid,
                mode: payment.mode,
                amountPaid,
                totalPaid: payment.totalPaid,
                totalDue: payment.totalDueAmount,
                receiptNumber: payment.receiptNumber,
            };
        });

        const response = {
            student: {
                admissionNumber: student.admissionNumber,
                fullName: student.fullName,
                fatherName: student.fatherName,
                section: student.section,
                rollNumber: student.rollNumber,
            },
            payments: paymentDetails,
        };

        res.status(200).json({ message: 'Payment details retrieved successfully!', data: response });
    } catch (error) {
        console.error('Error retrieving payment details:', error);
        res.status(500).json({ error: 'Error retrieving payment details. Please try again' });
    }
});











router.post('/paymentsss', async (req, res) => {
    const { admissionNumber, busFeePaid, bookFeePaid, examFeePaid, mode } = req.body;

    try {
        // Find the student by admission number
        const student = await Admission.findOne({ admissionNumber });
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Calculate total fee and net fee
        const totalFee = student.totalFee;
        const netFee = totalFee - student.discount;

        // Calculate due amount for each fee type
        const busFeeDue = student.busFee - (busFeePaid || 0);
        const bookFeeDue = student.bookFee - (bookFeePaid || 0);
        const examFeeDue = student.examFee - (examFeePaid || 0);

        // Create a new payment record
        const newPayment = new FeePayment({
            admissionNumber,
            name: student.fullName,
            class: student.class,
            section: student.section,
            rollNo: student.rollNo,
            schoolFee: totalFee,
            examFee: student.examFee,
            busFee: student.busFee,
            bookFee: student.bookFee,
            totalFee,
            discount: student.discount,
            oldBalance: 0, // Assuming old balance is not included in this context
            netFee,
            busFeePaid,
            busFeeDue,
            bookFeePaid,
            bookFeeDue,
            examFeePaid,
            examFeeDue,
            mode,
           
            date: new Date()
        });
        await newPayment.save();

        res.status(201).json({ message: 'Payment successful!', payment: newPayment });
    } catch (error) {
        console.error('Error making payment:', error);
        res.status(500).json({ error: 'Error making payment. Please try again' });
    }
});

// routes/feePayments.js
router.get('/payments', async (req, res) => {
    try {
        // Retrieve all payment records
        const payments = await FeePayment.find();
        res.status(200).json(payments);
    } catch (error) {
        console.error('Error fetching payments:', error);
        res.status(500).json({ error: 'Error fetching payments. Please try again' });
    }
});

router.get('/payments/:admissionNumber', async (req, res) => {
    const admissionNumber = req.params.admissionNumber;

    try {
        // Retrieve payment records by admission number and sort by date in descending order
        const payments = await FeePayment.find({ admissionNumber }).sort({ date: -1 });
        
        if (payments.length === 0) {
            return res.status(404).json({ message: 'No payments found for this admission number' });
        }

        res.status(200).json(payments);
    } catch (error) {
        console.error('Error fetching payments:', error);
        res.status(500).json({ error: 'Error fetching payments. Please try again' });
    }
});


// PUT route to edit payment
router.put('/payment/:paymentId', async (req, res) => {
    const paymentId = req.params.paymentId;
    const { schoolFeePaid, busFeePaid, bookFeePaid, examFeePaid, oldFeePaid, receiptNumber } = req.body;

    try {
        // Find the payment record by ID
        const payment = await FeePayment.findById(paymentId);
        if (!payment) {
            return res.status(404).json({ message: 'Payment record not found' });
        }

        // Update the payment record
        payment.schoolFeePaid = schoolFeePaid || payment.schoolFeePaid;
        payment.busFeePaid = busFeePaid || payment.busFeePaid;
        payment.bookFeePaid = bookFeePaid || payment.bookFeePaid;
        payment.examFeePaid = examFeePaid || payment.examFeePaid;
        payment.oldFeePaid = oldFeePaid || payment.oldFeePaid;
        payment.receiptNumber = receiptNumber || payment.receiptNumber;

        // Recalculate due amounts if needed
        payment.schoolFeeDue = payment.totalFee - payment.schoolFeePaid;
        payment.busFeeDue = payment.busFee - payment.busFeePaid;
        payment.bookFeeDue = payment.bookFee - payment.bookFeePaid;
        payment.examFeeDue = payment.examFee - payment.examFeePaid;
        payment.oldFeeDue = payment.oldBalance - payment.oldFeePaid;

        // Save the updated payment record
        await payment.save();

        res.status(200).json({ message: 'Payment record updated successfully', payment });
    } catch (error) {
        console.error('Error updating payment record:', error);
        res.status(500).json({ error: 'Error updating payment record. Please try again' });
    }
});

router.put('/paymentapi/:id', async (req, res) => {
    try {
        const paymentId = req.params.id;
        const updatedPaymentData = req.body; // Assuming you send updated payment data in the request body

        // Update payment record
        const updatedPayment = await FeePayment.findByIdAndUpdate(paymentId, updatedPaymentData, { new: true });

        if (!updatedPayment) {
            return res.status(404).json({ error: 'Payment not found' });
        }

        res.status(200).json(updatedPayment);
    } catch (error) {
        console.error('Error updating payment:', error);
        res.status(500).json({ error: 'Error updating payment. Please try again' });
    }
});

router.get('/get-payments', async (req, res) => {
    try {
        // Fetch payment history data from the database
        const paymentHistory = await FeePayment.find();

        // If there's no payment history data, return an empty array
        if (!paymentHistory) {
            return res.status(404).json({ message: 'Payment history not found' });
        }

        // If payment history data is found, return it
        res.status(200).json(paymentHistory);
    } catch (error) {
        console.error('Error fetching payment history:', error);
        res.status(500).json({ error: 'Error fetching payment history. Please try again' });
    }
});

router.get('/get-payments-by-admission', async (req, res) => {
    const { admissionNumber } = req.query;

    if (!admissionNumber) {
        return res.status(400).json({ message: 'Admission number is required' });
    }

    try {
        const paymentHistory = await FeePayment.find({ admissionNumber: admissionNumber });

        if (!paymentHistory || paymentHistory.length === 0) {
            return res.status(404).json({ message: 'Payment history not found' });
        }

        res.status(200).json(paymentHistory);
    } catch (error) {
        console.error('Error fetching payment history:', error);
        res.status(500).json({ error: 'Error fetching payment history. Please try again' });
    }
});



router.post('/staff', async (req, res) => {
    try {
        const staff = new Staff(req.body);
        await staff.save();
        res.status(201).send(staff);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Get all staff
router.get('/allstaff', async (req, res) => {
    try {
        const staff = await Staff.find();
        res.status(200).send(staff);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Get staff by ID
router.get('/staff/:staffid', async (req, res) => {
    try {
        const staff = await Staff.findOne({ staffid: req.params.staffid });
        if (!staff) {
            return res.status(404).send();
        }
        res.status(200).send(staff);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Update staff by ID
router.put('/staff/:staffid', async (req, res) => {
    try {
        const staff = await Staff.findOneAndUpdate({ staffid: req.params.staffid }, req.body, { new: true, runValidators: true });
        if (!staff) {
            return res.status(404).send();
        }
        res.status(200).send(staff);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Delete staff by ID
router.delete('/staff/:staffid', async (req, res) => {
    try {
        const staff = await Staff.findOneAndDelete({ staffid: req.params.staffid });
        if (!staff) {
            return res.status(404).send();
        }
        res.status(200).send(staff);
    } catch (error) {
        res.status(500).send(error);
    }
});



// Add new attendance
router.post('/staffattendence', async (req, res) => {
    try {
        const { staffId, date, status } = req.body;

        // Check if the staff ID is valid
        const staff = await Staff.findOne({ staffid: staffId });
        if (!staff) {
            return res.status(404).send({ error: 'Staff not found' });
        }

        const attendance = new StaffAttendance({ staffId, date, status });
        await attendance.save();
        res.status(201).send(attendance);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Get attendance for a staff by ID
router.get('/staffattendence/:staffId', async (req, res) => {
    try {
        const attendance = await StaffAttendance.find({ staffId: req.params.staffId });
        res.status(200).send(attendance);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Update attendance by ID
router.put('/staffattendence/:id', async (req, res) => {
    try {
        const attendance = await StaffAttendance.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!attendance) {
            return res.status(404).send();
        }
        res.status(200).send(attendance);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Delete attendance by ID
router.delete('/staffatendence/:id', async (req, res) => {
    try {
        const attendance = await StaffAttendance.findByIdAndDelete(req.params.id);
        if (!attendance) {
            return res.status(404).send();
        }
        res.status(200).send(attendance);
    } catch (error) {
        res.status(500).send(error);
    }
});// Define routes for Staff
router.post('/staff', async (req, res) => {
    try {
        const staff = new Staff(req.body);
        await staff.save();
        res.status(201).send(staff);
    } catch (error) {
        res.status(400).send(error);
    }
});

router.get('/staff', async (req, res) => {
    try {
        const staff = await Staff.find();
        res.status(200).send(staff);
    } catch (error) {
        res.status(500).send(error);
    }
});

router.get('/staff/:id', async (req, res) => {
    try {
        const staff = await Staff.findById(req.params.id);
        if (!staff) {
            return res.status(404).send();
        }
        res.status(200).send(staff);
    } catch (error) {
        res.status(500).send(error);
    }
});

router.put('/staff/:id', async (req, res) => {
    try {
        const staff = await Staff.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!staff) {
            return res.status(404).send();
        }
        res.status(200).send(staff);
    } catch (error) {
        res.status(400).send(error);
    }
});

router.delete('/staff/:id', async (req, res) => {
    try {
        const staff = await Staff.findByIdAndDelete(req.params.id);
        if (!staff) {
            return res.status(404).send();
        }
        res.status(200).send(staff);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Define routes for StaffAttendance
router.post('/staff-attendance', async (req, res) => {
    try {
        const attendance = new StaffAttendance(req.body);
        await attendance.save();
        res.status(201).send(attendance);
    } catch (error) {
        res.status(400).send(error);
    }
});

router.get('/staff-attendance', async (req, res) => {
    try {
        const attendance = await StaffAttendance.find();
        res.status(200).send(attendance);
    } catch (error) {
        res.status(500).send(error);
    }
});

router.get('/staff-attendance/:id', async (req, res) => {
    try {
        const attendance = await StaffAttendance.findById(req.params.id);
        if (!attendance) {
            return res.status(404).send();
        }
        res.status(200).send(attendance);
    } catch (error) {
        res.status(500).send(error);
    }
});

router.put('/staff-attendance/:id', async (req, res) => {
    try {
        const attendance = await StaffAttendance.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!attendance) {
            return res.status(404).send();
        }
        res.status(200).send(attendance);
    } catch (error) {
        res.status(400).send(error);
    }
});

router.delete('/staff-attendance/:id', async (req, res) => {
    try {
        const attendance = await StaffAttendance.findByIdAndDelete(req.params.id);
        if (!attendance) {
            return res.status(404).send();
        }
        res.status(200).send(attendance);
    } catch (error) {
        res.status(500).send(error);
    }
});


// GET all routes
// GET all routes
router.get('/routes', async (req, res) => {
    try {
        const routes = await Route.find();
        res.json(routes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET one route
router.get('/routes/:id', getRoute, (req, res) => {
    res.json(res.route);
});

// POST a new route
router.post('/routes', async (req, res) => {
    const route = new Route({
        name: req.body.name,
        stops: req.body.stops
    });
    try {
        const newRoute = await route.save();
        res.status(201).json(newRoute);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PUT update route
router.put('/routes/:id', getRoute, async (req, res) => {
    if (req.body.name != null) {
        res.route.name = req.body.name;
    }
    if (req.body.stops != null) {
        res.route.stops = req.body.stops;
    }
    try {
        const updatedRoute = await res.route.save();
        res.json(updatedRoute);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE a route
router.delete('/routes/:id', async (req, res) => {
    try {
        const result = await Route.deleteOne({ _id: req.params.id });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Cannot find route' });
        }
        res.json({ message: 'Deleted route' });
    } catch (err) {
        console.error('Error deleting route:', err);
        res.status(500).json({ message: 'Error deleting route', error: err.message });
    }
});

async function getRoute(req, res, next) {
    let route;
    try {
        route = await Route.findById(req.params.id);
        if (route == null) {
            return res.status(404).json({ message: 'Cannot find route' });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
    res.route = route;
    next();
}





module.exports = router;
