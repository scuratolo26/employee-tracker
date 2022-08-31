const inquirer = require('inquirer');
const db = require('./db/connection');
const cTable = require('console.table');

// Options for user prompt
const selectOption = [
    {
        type: 'list',
        name: 'userSelected',
        message: 'Welcome to the Employee Manager! What would you like to do?',
        choices: ['View all departments', 'View all roles', 'View all employees', 'Add department', 'Add role', 'Add employee', 'Update employee role'],
        default: 'View all departments'
    },
];

// Function to initialize app
function init(options) {
    return inquirer.prompt(options)
};

// Function call to initialize app
init(selectOption)