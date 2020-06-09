const express = require('express'),
      app = express(),
      mysql = require('mysql'),
      bodyParser = require('body-parser'),
      path = require('path');

//MySQL connection link
const connection = mysql.createConnection({
	host: "localhost",
	user: "root",
	database: "bloodbank",
	password: "",
	// debug: true,
	multipleStatements: true,
	typeCast: function castField(field, useDefaultTypeCasting) {
		// We only want to cast bit fields that have a single-bit in them. If the field
		// has more than one bit, then we cannot assume it is supposed to be a Boolean.
		if (field.type === "BIT" && field.length === 1) {
			var bytes = field.buffer();

			// A Buffer in Node represents a collection of 8-bit unsigned integers.
			// Therefore, our single "bit field" comes back as the bits '0000 0001',
			// which is equivalent to the number 1.
			return bytes[0] === 1;
		}

		return useDefaultTypeCasting();
	},
});        
var hospitalId;
app.set('view engine','ejs');
app.use(express.static(path.join(__dirname , 'public')));      
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

//Donor registeration page
app.get("/donor", function (req, res) {
	res.render("donorRegistration");
});


//send the donorRegistration data here
app.post('/registerDonor',function(req,res)
{
    console.log(req.body);
    var q = "INSERT INTO donors(first_name,last_name,blood_group,rh_factor,age,contact_number,email) VALUES ?";
    var values = [
		[
			req.body.first_name,
			req.body.last_name,
			req.body.blood_group,
			req.body.rh_factor,
			+req.body.age,
			req.body.contact_number,
		    req.body.email
        ]
	];
    connection.query(q,[values], function(err, results){
        if(err) throw err;
        // console.log( results); 
        res.render("donorRegistered", {
			id: results.insertId,
			fname: req.body.first_name,
			lname: req.body.last_name,
		});
    });
  
});
//login page for the Blood Bank
app.get('/bankLogin',function(req,res)
{
    var error = req.query.error;
    console.log(error);
    res.render('bankLogin',{error:error}); 
});

//login page for the Hospitals
app.get('/hospitalLogin',function(req,res)
{
    var error = req.query.error;
    console.log(error);
    res.render('hospitalLogin',{error:error}); 
});

//authorization
app.post('/authBank',function(req,res)
{
    var username = req.body.username;
    var password = req.body.password;
    if(username=="admin" && password=="123456")
    {
        res.redirect("bloodbank"); // successful login
    }
    else
    {
        res.redirect("bankLogin?error=1")
    }
});

//Authorizing Hospitals
app.post('/authHospital',function(req,res)
{
    var username = req.body.username;
    var password = req.body.password;
    var q = "SELECT id,username,pass,hospital_name FROM hospitals WHERE username = ? && pass = ?";
    connection.query(q,[username,password], function(err, results){
        console.log( results); 
        if(results.length > 0)
        {
            hospitalId = results[0].id;
            res.render("hospital",{hospital_name : results[0].hospital_name,hospital_id : hospitalId});// pass hospital
        }
        else
        {
            res.redirect("hospitalLogin?error=1")
        }
    });
});

//BloodBank Admin Panel
app.get('/bloodbank',function(req,res)
{
    var q = "SELECT * FROM blood_bank";
    connection.query(q,function(error,results) {
        res.render("bloodbank",{data:results});
    })
     
});

app.get('/bbBloodRequest',function(req,res)
{
    var q = "SELECT blood_request.id as request_id, hospital_name,first_name,last_name,blood_group,rh_factor,quantity_needed from blood_request INNER JOIN patients ON blood_request.patient_id = patients.id INNER JOIN hospitals ON blood_request.hospital_id = hospitals.id WHERE blood_request.hospital_id = 1 && blood_request.approval = 0;";
    connection.query(q, function(err, results){
        console.log(results.length);
        var h1 = results; 
        var q = "SELECT SUM(quantity_needed) as total from blood_request INNER JOIN patients ON blood_request.patient_id = patients.id INNER JOIN hospitals ON blood_request.hospital_id = hospitals.id WHERE blood_request.hospital_id = 1 && blood_request.approval = 0;";
        connection.query(q,function(err, results){
            var t1 = results[0].total;
            var q = "SELECT blood_request.id as request_id, hospital_name,first_name,last_name,blood_group,rh_factor,quantity_needed from blood_request INNER JOIN patients ON blood_request.patient_id = patients.id INNER JOIN hospitals ON blood_request.hospital_id = hospitals.id WHERE blood_request.hospital_id = 2 && blood_request.approval = 0;";
            connection.query(q, function(err, results){
                console.log(results.length);
                var h2 = results; 
                var q = "SELECT SUM(quantity_needed) as total from blood_request INNER JOIN patients ON blood_request.patient_id = patients.id INNER JOIN hospitals ON blood_request.hospital_id = hospitals.id WHERE blood_request.hospital_id = 2 && blood_request.approval = 0;";
                connection.query(q,function(err, results){
                    var t2 = results[0].total;
                    // res.render("bbBloodRequests",{h1:h1,t1:t1,h2:h2,t2:t2}); 
                    var q = "SELECT blood_request.id as request_id, hospital_name,first_name,last_name,blood_group,rh_factor,quantity_needed from blood_request INNER JOIN patients ON blood_request.patient_id = patients.id INNER JOIN hospitals ON blood_request.hospital_id = hospitals.id WHERE blood_request.hospital_id = 3 && blood_request.approval = 0;";
                    connection.query(q, function(err, results){
                        console.log(results.length);
                        var h3 = results; 
                        var q = "SELECT SUM(quantity_needed) as total from blood_request INNER JOIN patients ON blood_request.patient_id = patients.id INNER JOIN hospitals ON blood_request.hospital_id = hospitals.id WHERE blood_request.hospital_id = 3 && blood_request.approval = 0;";
                        connection.query(q,function(err, results){
                            var t3 = results[0].total;
                            var q = "SELECT * FROM blood_bank";
                            var er = +req.query.error;
                            console.log(er + " error ")
                            connection.query(q,function(error,results) {
                                res.render("bbBloodRequests", {
								h1: h1,
								t1: t1,
								h2: h2,
								t2: t2,
								h3: h3,
								t3: t3,
                                data:results,
                                er: er
							});
                            })
                            
                        });
                    });
                });
            });
            
        });
    });
    
});

app.get('/updateRequest',function(req,res)
{

    var request_id = req.query.id;
    var blood_group = req.query.blood_group;

    var rh_factor;
    if('-'== req.query.rh_factor)
    {
        rh_factor = '-';
    }
    else{
        rh_factor = '+';
    }
    console.log(request_id + "=request_id");
    var q = "SELECT quantity_needed FROM blood_request WHERE id = ?;";
    connection.query(q,[request_id,request_id], function(err, results){
        console.log( results[0].quantity_needed + "=quantity"); 
        var quantity = +results[0].quantity_needed;
        // Here add the blood donation RULES ( CHECK AVAILABLITY )
        //0 - A+
        //1 - A-
        //2 - AB+
        //3 - AB-
        //4 - B+
        //5 - B-
        //6 - O+
        //7 - O-
        var donor_blood_group = 'NULL';
        var q= "SELECT * FROM blood_bank;";
        connection.query(q, function(error,results){
            
            console.log("results + " + results[2].blood_group);
            if(blood_group == 'A')
            {
                
                if(rh_factor == '-')
                {
                    if(results[1].available >= quantity) //A-
                    {
                        donor_blood_group = results[1].blood_group;
                    }
                    else if (results[7].available >= quantity) //O-
                    {
                        donor_blood_group = results[7].blood_group; // O-
                    }
                }
                else 
                { // if rh_factor is +
                    if(results[0].available >= quantity) //A+
                    {
                        donor_blood_group = results[0].blood_group; 
                    }
                    else if (results[6].available >= quantity) //O+
                    {
                        donor_blood_group = results[6].blood_group; 
                    }
                    else if(results[1].available >= quantity) //A-
                    {
                        donor_blood_group = results[1].blood_group; 
                    }
                    else if (results[7].available >= quantity) //O-
                    {
                        donor_blood_group = results[7].blood_group; 
                    }
                }
            }
            if(blood_group == 'B')
            {
                
                if(rh_factor == '-')
                {
                    if(results[5].available >= quantity) //B-
                    {
                        donor_blood_group = results[5].blood_group;
                    }
                    else if (results[7].available >= quantity) //O-
                    {
                        donor_blood_group = results[7].blood_group; // O-
                    }
                }
                else 
                { // if rh_factor is +
                    if(results[4].available >= quantity) //B+
                    {
                        donor_blood_group = results[4].blood_group; 
                    }
                    else if (results[6].available >= quantity) //O+
                    {
                        donor_blood_group = results[6].blood_group; 
                    }
                    else if(results[5].available >= quantity) //B-
                    {
                        donor_blood_group = results[5].blood_group; 
                    }
                    else if (results[7].available >= quantity) //O-
                    {
                        donor_blood_group = results[7].blood_group; 
                    }
                }
            }
            if(blood_group == 'AB')
            {
                
                if(rh_factor == '-')
                {
                    if(results[3].available >= quantity) //AB-
                    {
                        donor_blood_group = results[3].blood_group;
                    }
                    else if(results[1].available >= quantity) //A-
                    {
                        donor_blood_group = results[1].blood_group;
                    }
                    else if(results[5].available >= quantity) //B-
                    {
                        donor_blood_group = results[5].blood_group;
                    }
                    else if (results[7].available >= quantity) //O-
                    {
                        donor_blood_group = results[7].blood_group; // O-
                    }
                }
                else 
                { // if rh_factor is +
                    if(results[2].available >= quantity) //AB+
                    {
                        donor_blood_group = results[2].blood_group;
                    }
                    else if(results[0].available >= quantity) //A+
                    {
                        donor_blood_group = results[0].blood_group;
                    }
                    else if(results[4].available >= quantity) //B+
                    {
                        donor_blood_group = results[4].blood_group;
                    }
                    else if(results[6].available >= quantity) //O+
                    {
                        donor_blood_group = results[6].blood_group;
                    }
                    else if(results[3].available >= quantity) //AB-
                    {
                        donor_blood_group = results[3].blood_group;
                    }
                    else if(results[1].available >= quantity) //A-
                    {
                        donor_blood_group = results[1].blood_group;
                    }
                    else if(results[5].available >= quantity) //B-
                    {
                        donor_blood_group = results[5].blood_group;
                    }
                    else if(results[7].available >= quantity) //O+
                    {
                        donor_blood_group = results[7].blood_group;
                    }
                    
                }
            }
            if(blood_group == 'O')
            {
                
                if(rh_factor == '-')
                {
                    console.log(rh_factor);
                    if(results[7].available >= quantity) //O-
                    {
                        donor_blood_group = results[7].blood_group
                    }
                }
                else 
                { // if rh_factor is +
                console.log(rh_factor);
                console.log(results[6].available + " = available quantity");
                console.log(quantity + " = req quantity");
                    if(results[6].available >= quantity) //O+
                    {
                        console.log(results[6].available >= quantity)
                        donor_blood_group = results[6].blood_group;
                    }
                    else if(results[7].available >= quantity) //O-
                    {
                        donor_blood_group = results[7].blood_group;
                    }
                }
            }
            console.log(donor_blood_group + "= donor bg");
        
        
            // here check if new blood group was added 
            if(donor_blood_group != 'NULL')
            {
                var q = "UPDATE blood_bank SET total_donated = total_donated + ? WHERE blood_group = ? && rh_factor = ?;UPDATE blood_bank SET available = available - ? WHERE blood_group = ? && rh_factor = ?;UPDATE blood_request SET approval = 1 WHERE id = ?;";
        
                connection.query(
                    q,
                    [
                        quantity,
                        donor_blood_group,
                        rh_factor,
                        quantity,
                        donor_blood_group,
                        rh_factor,
                        request_id
                    ],
                    function (err, results) {
                        console.log(rh_factor)
                        console.log(results);
                        res.redirect("bbBloodRequest?error=0");
                    }
                );
            }
            else 
            {
                res.redirect("bbBloodRequest?error=1"); // error for bbBloodRequest Page
            }
        });
    });
     
});

//Hospital Panel
app.get('/hospital',function(req,res)
{
    var q = "SELECT hospital_name FROM hospitals WHERE id = ?";
    connection.query(q,[hospitalId], function(err, results){
        console.log( results); 
        if(results.length > 0)
        {
            console.log(results[0]);
            res.render("hospital",{hospital_name : results[0].hospital_name});// pass hospital
        }
        else
        {
            res.redirect("hospitalLogin?error=1")
        }
    });
    // res.render("hospital"); 
});


//add Report
app.get('/addReport',function(req,res)
{
    res.render("addReport"); 
});

//POST FOR addReport
app.post('/uploadReport',function(req,res)
{
    console.log(req.body);
    var diabetic = (req.body.diabetic_patient == '0') ? 0 : 1;
    var bp = (req.body.bp_patient == '0') ? 0 : 1;
    var hiv = (req.body.hiv_patient == '0') ? 0 : 1;
    var q = "INSERT INTO reports(diabetic,bp_patient,hiv_patient,hb,donor_id) VALUES ?";
    var values = [
		[
			diabetic,
			bp,
			hiv,
            req.body.donor_hb,
			req.body.donor_id
        ]
	];
    connection.query(q,[values], function(err, results){
        res.redirect("/addDonation?donorId="+req.body.donor_id);
    });
});


//add Report
app.get('/addDonation',function(req,res)
{
    var donor_id = req.query.donorId;
    var q = "SELECT reports.id as report_id,diabetic,bp_patient,hiv_patient,hb,donor_id,first_name,last_name,rh_factor,blood_group,age,contact_number,email FROM reports INNER JOIN donors ON reports.donor_id = donors.id WHERE donors.id = ? ORDER BY reports.id DESC LIMIT 1;";
    connection.query(q,[donor_id], function(err, results){
        console.log(results[0]); 
        if(results.length > 0)
        {
            if(results[0].diabetic==false && results[0].bp_patient==false && results[0].hiv_patient==false)
            {
                console.log(results[0]);
                res.render("addQuantity",results[0]); // pass ejs parameters
            }
            else
            {
                res.render("notEligible", {
					fname: results[0].first_name,
					lname: results[0].last_name,
				});
            }
        }
        else
        {
            res.send("No Donor found with that Id");
        }
    });
});

//POST for addQuantity
app.post('/uploadDonation',function(req,res)
{
    console.log(req.body);
    var report_id = +req.body.report_id;
    console.log(report_id);
    var quantity = req.body.quantity;
    var blood_group = req.body.blood_group;
    var rh_factor = req.body.rh_factor;
    var q = "INSERT INTO donations(report_id,quantity) VALUES ?";
    var values = [
		[
			report_id,
            quantity
        ]
	];
    connection.query(q,[values], function(err, results){
      var q = "UPDATE blood_bank SET total_recieved = total_recieved + ? WHERE blood_group = ? && rh_factor = ?;UPDATE blood_bank SET available = available + ? WHERE blood_group = ? && rh_factor = ?;";
   
        connection.query(q,[+quantity,
               blood_group,
               rh_factor,
               +quantity,
               blood_group,
               rh_factor], function(err, results){
            console.log(results);
            res.render("bloodDonated");
        });
    });
});

//add Patient
app.get('/addPatient',function(req,res)
{
    res.render("addPatient",{hospital_id : hospitalId}); 
})


//POST for addPatient
app.post('/uploadPatient',function(req,res)
{
    console.log(req.body);
    
    // console.log(report_id);
    var p = req.body;
    var q = "INSERT INTO patients(first_name,last_name,blood_group,rh_factor,age,hospital_id) VALUES ?";
    var values = [
		[
            p.first_name,
            p.last_name,
            p.blood_group,
            p.rh_factor,
            +p.age,
            +p.hospital_id
        ]
	];
    connection.query(q,[values], function(err, results){
        var q = "SELECT * FROM patients WHERE id = ?";
        connection.query(q,[results.insertId], function(err, results){
            console.log(results[0]);
            res.render("addPatientQuantity",results[0]);
        });
    });
});


//POST for addPatientQuantity
app.post('/uploadPatientQuantity',function(req,res)
{
    console.log(req.body);
    
    // console.log(report_id);
    var p = req.body;
    var q = "INSERT INTO blood_request(hospital_id,patient_id,quantity_needed) VALUES ?";
    var values = [
		[
            +p.hospital_id,
            +p.patient_id,
            +p.quantity
        ]
	];
    connection.query(q,[values], function(err, results){
        res.render("bloodRequested");
    });
});

//home
app.get('/',function(req,res){
    res.render("home");
});

//add Patient
app.get('/hBloodRequests',function(req,res)
{
    var q = "SELECT hospital_name,first_name,last_name,age,blood_group,rh_factor,blood_request.approval as approval,quantity_needed from blood_request INNER JOIN patients ON blood_request.patient_id = patients.id INNER JOIN hospitals ON blood_request.hospital_id = hospitals.id WHERE blood_request.hospital_id = ?"; 
    connection.query(q,[hospitalId],function(error,results){
        console.log(results.length);
        res.render("hBloodRequests",{data:results,total:results.length});
    });
})

app.get('/bbStatistics',function(req,res){
    var q="SELECT * FROM blood_bank;";
    connection.query(q,function(error,results){
        var blood_bank = results;
        var q="select count(*) as total_donors FROM (select count(donor_id) from donations  INNER JOIN reports ON donations.report_id = reports.id GROUP BY reports.donor_id) as tab;";
        connection.query(q,function(error,results){
            var total_donors = results[0].total_donors;
            var q="select count(*) as total_patients from blood_request where approval = 1;";
            connection.query(q,function(error,results){
                var total_patients=results[0].total_patients;
                var q="SELECT sum(total_recieved) as total FROM blood_bank";
                connection.query(q, function(error,results){
                    res.render("bbStatistics", {
					blood_bank: blood_bank,
					total_donors: total_donors,
					total_patients: total_patients,
                    total : results[0].total
				});
                });
                

            });
        });
    });
    
});



app.listen(process.env.PORT || 3000,function()
{
	console.log("PORT STARTED ON " + process.env.PORT || + "3000");
});