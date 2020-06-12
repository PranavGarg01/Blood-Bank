//this script registers donors and adds report and donations into the database.
var faker = require('faker');
const mysql = require('mysql');
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
var i=0;
const timer = ms => new Promise( res => setTimeout(res, ms));
for(i=0;i<10;i++)
{
    console.log("wait 3 seconds")
    timer(3000).then(_=>console.log("done"));
    var firstName = faker.name.firstName();
    var lastName = faker.name.lastName();
    var age = faker.random.arrayElement([18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35]);
    var blood_group = faker.random.arrayElement(["A","B","AB","O","O","A","B","O"]);
    var rh_factor = faker.random.arrayElement(["+","-"]);
    var contact_number = faker.phone.phoneNumber();
    var email = faker.internet.email();
    var q = "INSERT INTO donors(first_name,last_name,blood_group,rh_factor,age,contact_number,email) VALUES ?";
    var values = [
            [
                firstName,
                lastName,
                blood_group,
                rh_factor,
                age,
                contact_number,
                email
            ]
    ];
    connection.query(q,[values],function(error,results){
        // console.log(results);
        console.log("wait 3 seconds")
        timer(3000).then(_=>console.log("done"));
        var donor_id = results.insertId;
        console.log("id = "+donor_id);
        var diabetic = 0;
        var bp = 0;
        var hiv = 0;
        var hb = faker.finance.amount(12.5,14,1);
        var q = "INSERT INTO reports(diabetic,bp_patient,hiv_patient,hb,donor_id) VALUES ?";
        var values = [
            [
                diabetic,
                bp,
                hiv,
                hb,
                donor_id
            ]
        ];
        connection.query(q,[values],function(err,res){
            
            console.log("wait 3 seconds")
            timer(3000).then(_=>console.log("done"));
            console.log(res)
            var report_id = res.insertId;
            var quantity = faker.random.number({min:1, max:4});
            var q = "INSERT INTO donations(report_id,quantity) VALUES ?";
            var values = [
                [
                    report_id,
                    quantity
                ]
            ];
            connection.query(q,[values],function(err,results){
                console.log("wait 3 seconds")
                timer(3000).then(_=>console.log("done"));
                var q = "SELECT * from donors WHERE donors.id = ?;";
                connection.query(q,[donor_id],function(err,results){
                    var bg = results[0].blood_group;
                    var rh = results[0].rh_factor;
                    var q = "UPDATE blood_bank SET total_recieved = total_recieved + ? WHERE blood_group = ? && rh_factor = ?;UPDATE blood_bank SET available = available + ? WHERE blood_group = ? && rh_factor = ?;";
                    connection.query(q,[quantity,
                        bg,
                        rh,
                        quantity,
                        bg,
                        rh
                        ], function(err, results){
                            console.log("wait 3 seconds")
                            timer(3000).then(_=>console.log("done"));
                            console.log("id = "+donor_id + " name = "+ firstName + " bg = "+ bg);
                    });
                });
            });
        });
    });
}