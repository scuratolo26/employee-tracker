const inquirer = require('inquirer');
const db = require('./db/connection');
const cTable = require('console.table');

// Options for user prompt
const selectOption = [
    {
        type: 'list',
        name: 'userSelected',
        message: 'What would you like to do?',
        choices: ['View all departments', 'View all roles', 'View all employees', 'Add department', 'Add role', 'Add employee', 'Update employee role'],
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

function userSelected(input) {
    switch (input) {
        case 'View all departments':
            return viewAllDepartments();
        case 'View all roles':
            return viewAllRoles();
        case 'View all employees':
            return viewAllEmployees();
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