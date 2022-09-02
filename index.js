const inquirer = require('inquirer');
const db = require('./db/connection');
const cTable = require('console.table');

// Options for user prompt
const selectOption = [
    {
        type: 'list',
        name: 'userSelected',
        message: 'What would you like to do?',
        choices: ['View all departments', 'View all roles', 'View all employees', 'Add department', 'Add role', 'Add employee', 'Update employee role', 'Exit Employee Manager'],
        default: 'View all departments'
    },
];

// Function to view all departments
function viewAllDepartments() {
    const sql = `
    SELECT
    id,
    name AS 'Department'
    FROM department
    `;

    db.query(sql, (err, department) => {
        if (err) {
            console.log(`There has been an error: ${err.sqlMessage}`)
            return;
        }

        console.table(department);

        // start inquirer over
        init(selectOption)
            .then(userSelectedObject => userSelected
                (userSelectedObject.userSelected))
            .catch((error) => {
                console.log('Error', error);
            });
    });
};

// Function to view all roles
function viewAllRoles() {
    const sql = `
    SELECT 
    role.id, 
    role.title AS 'Job Title',
    department.name AS 'Department',
    role.salary AS 'Salary'
    FROM role
    LEFT JOIN department ON role.department_id = department.id`;

    db.query(sql, (err, role) => {
        if (err) {
            console.log(`There has been an error: ${err.sqlMessage}`)
            return;
        }

        console.table(role);

        // start inquirer over
        init(selectOption)
            .then(userSelectedObject => userSelected
                (userSelectedObject.userSelected))
            .catch((error) => {
                console.log('Error', error);
            });
    });
};

// Function to view all employees
function viewAllEmployees() {
    const sql = `
    SELECT
    employee.id, 
    employee.first_name AS 'First Name',
    employee.last_name AS 'Last Name',
    role.title AS 'Job Title',
    department.name AS 'Department',
    role.salary AS 'Salary',
    employee.manager_id AS 'Manager'
    FROM employee
    LEFT JOIN role ON employee.role_id = role.id
    LEFT JOIN department ON role.department_id = department.id
    `;

    db.query(sql, (err, employee) => {
        if (err) {
            console.log(`There has been an error: ${err.sqlMessage}`)
            return;
        }

        console.table(employee);

        // start inquirer over
        init(selectOption)
            .then(userSelectedObject => userSelected
                (userSelectedObject.userSelected))
            .catch((error) => {
                console.log('Error', error);
            });
    });
};

// Function to add new department
function addNewDepartment() {
    //    Ask user for department name
    inquirer.prompt([
        {
            type: 'input',
            name: 'departmentName',
            message: 'What is the name of the new department?'
        }
    ])
        // Insert department name into db
        .then(input => {
            const sql = `
        INSERT INTO
        department (name)
        VALUES (?)
        `;

            db.query(sql, input.departmentName, (err) => {
                if (err) {
                    console.log(`There has been an error: ${err.sqlMessage}`)
                    return;
                }

                console.log(`Added ${input.departmentName} to database.`)

                // start inquirer over
                init(selectOption)
                    .then(userSelectedObject => userSelected
                        (userSelectedObject.userSelected))
                    .catch((error) => {
                        console.log('Error', error);
                    });
            });

        })
};

// Function to add new role
function addNewRole() {
    getAllDepartments()
        .then(([rows]) => {
            inquirer.prompt([
                {
                    type: 'input',
                    name: 'newRoleName',
                    message: 'What is the name of the role?'
                },
                {
                    type: 'input',
                    name: 'newSalary',
                    message: 'What is the salary of the role?'
                },
                {
                    type: 'list',
                    name: 'newRoleDepartment',
                    message: 'Which department does the role belong to?',
                    choices: rows.map(row => {
                        return { name: row.name, value: row.id };
                    })
                }
            ])
                .then(input => {
                    const sql = `
            INSERT INTO
            role (title, salary, department_id)
            VALUES (?, ?, ?)
            `;

                    db.query(sql, [input.newRoleName, input.newSalary, input.newRoleDepartment], (err) => {
                        if (err) {
                            console.log(`There has been an error: ${err.sqlMessage}`)
                            return;
                        }

                        console.log(`Added ${input.newRoleName}`);
                        // start inquirer over
                        init(selectOption)
                            .then(userSelectedObject => userSelected
                                (userSelectedObject.userSelected))
                            .catch((error) => {
                                console.log('Error', error);
                            });
                    });
                });
        })
};

// Function to add new employee
function addNewEmployee() {
    getAllEmployees() //to use for manager list select
        .then(([employeeRows]) => {

            getAllRoles() //to use for role list select
                .then(([roleRows]) => {
                    inquirer.prompt([
                        {
                            type: 'input',
                            name: 'firstName',
                            message: "What is the employee's first name?"
                        },
                        {
                            type: 'input',
                            name: 'lastName',
                            message: "What is the employee's last name?"
                        },
                        {
                            type: 'list',
                            name: 'role',
                            message: "What is the employee's role?",
                            choices: roleRows.map(row => {
                                return { name: row.title, value: row.id };
                            })
                        },
                        {
                            type: 'confirm',
                            name: 'confirmManager',
                            message: 'Does the employee have a manager?',
                            default: false
                        },
                        {
                            type: 'list',
                            name: 'addManager',
                            message: "Select the employee's manager from the list below.",
                            choices: employeeRows.map(employee => {
                                let name = employee.first_name.concat(' ', employee.last_name);
                                return { name: name, value: employee.id };
                            }),
                            when: ({ confirmManager }) => {
                                if (confirmManager) {
                                    return true;
                                } else {
                                    return false;
                                }
                            }
                        }
                    ])
                        .then(input => {
                            const sql = `
                INSERT INTO 
                employee (first_name, last_name, role_id, manager_id) 
                VALUES (?,?,?,?)`;
                            db.query(sql, [input.firstName, input.lastName, input.role, input.addManager], (err) => {
                                if (err) {
                                    console.log(`There has been an error: ${err.sqlMessage}`)
                                    return;
                                }
                                console.log(`Added ${input.firstName} ${input.lastName} to the database.`);
                                // start inquirer over
                                init(selectOption)
                                    .then(userSelectedObject => userSelected
                                        (userSelectedObject.userSelected))
                                    .catch((error) => {
                                        console.log('Error', error);
                                    });
                            });
                        });
                })
        });
};

function updateEmployeeRole() {
    getAllEmployees() //Used for list so user can select employee to update
        .then(([employeeRows]) => {
            getAllRoles() //Used for list so user can select a new role
                .then(([roleRows]) => {
                    inquirer.prompt([
                        {
                            type: 'list',
                            name: 'employee',
                            message: "Which employee's role would you like to update?",
                            choices: employeeRows.map(employee => {
                                let name = employee.first_name.concat(' ', employee.last_name);
                                return { name: name, value: employee.id };
                            })
                        },
                        {
                            type: 'list',
                            name: 'updatedRole',
                            message: 'Which role do you want to assign to the selected employee?',
                            choices: roleRows.map(row => {
                                return { name: row.title, value: row.id };
                            })
                        }
                    ])
                        .then(input => {
                            const sql = `
                        UPDATE employee 
                        SET role_id = ? 
                        WHERE id = ?`;

                            db.query(sql, [input.updatedRole, input.employee], (err) => {
                                if (err) {
                                    console.log(`There has been an error: ${err.sqlMessage}`)
                                    return;
                                }

                                console.log(`The employee's role has been updated.`);

                                // start inquirer over
                                init(selectOption)
                                    .then(userSelectedObject => userSelected
                                        (userSelectedObject.userSelected))
                                    .catch((error) => {
                                        console.log('Error', error);
                                    });
                            });
                        });
                });
        });
};

function getAllDepartments() {
    const sql = `SELECT * FROM department`;
    return db.promise().query(sql);
};

function getAllEmployees() {
    const sql = `SELECT * FROM employee`;
    return db.promise().query(sql);
};

function getAllRoles() {
    const sql = `SELECT * FROM role`;
    return db.promise().query(sql);
};

// Exit app
function exit() {
    process.exit();
};

// Switch statement to handle user selection
function userSelected(input) {
    switch (input) {
        case 'View all departments':
            return viewAllDepartments();
        case 'View all roles':
            return viewAllRoles();
        case 'View all employees':
            return viewAllEmployees();
        case 'Add department':
            return addNewDepartment();
        case 'Add role':
            return addNewRole();
        case 'Add employee':
            return addNewEmployee();
        case 'Update employee role':
            return updateEmployeeRole();
        case 'Exit Employee Manager':
            return exit();
        default:
            break;
    }
};

// Function to initialize app
function init(options) {
    return inquirer.prompt(options)
};

// Call function to initialize app
init(selectOption)
    .then(userSelectedObject => userSelected
        (userSelectedObject.userSelected))
    .catch((error) => {
        console.log('Error', error);
    });