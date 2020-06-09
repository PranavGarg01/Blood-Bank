var faker = require('faker');
var i;
const mysql = require('mysql');
const connection = mysql.createConnection({
	host: "localhost",
	user: "root",
	database: "bloodbank",
	password: "haatu peak",
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
for(i=0;i<4;i++) // change the i to your preference
{
    var firstName = faker.name.firstName();
    var lastName = faker.name.lastName();
    var age = faker.random.number({min:5, max:110});
    var blood_group = faker.random.arrayElement(["A","B","AB","O"]);
    var rh_factor = faker.random.arrayElement(["+","-"]);
    var hospital_id = 3; // change this yourself
    var q = "INSERT INTO patients(first_name,last_name,blood_group,rh_factor,age,hospital_id) VALUES ?";
    var values = [
		[
            firstName,
            lastName,
            blood_group,
            rh_factor,
            age,
            hospital_id
        ]
	];
    connection.query(q,[values], function(err, results){
        console.log("added  " + firstName + " " + lastName);
        var q = "SELECT * FROM patients WHERE id = ?";
        connection.query(q,[results.insertId], function(err, results){
            console.log(results[0]);
            var q = "INSERT INTO blood_request(hospital_id,patient_id,quantity_needed) VALUES ?";
            var values = [
                [
                    hospital_id,
                    results[0].id,
                    faker.random.number({min:1, max:6})
                ]
            ];
            connection.query(q,[values], function(err, results){
                console.log("added");

//<input type="number" id="quantity" name="quantity" min="1" max="5"><br><br>

            });
        });
    });
}