function getInput(id) {
    var value = document.getElementById(id).value;

    var inputText = [];
    var index = 0;
    var newIndex = true;
    for (var i = 0; i < value.length; i++) {
        if (newIndex) {
            inputText[index] = value[i];
            newIndex = false;
        } else if (value[i] != '\n') {
            inputText[index] += value[i];
        } else {
            index++;
            newIndex = true;
        }
    }
    console.log(inputText)
    return inputText;
}

// ------------------------ convertNFAtoRG module ----------------------------------------
function convertNFAtoRG() {
    document.getElementById('rg-table').innerHTML = "";
    var regularGrammar = "";

    //loop through all states
    for (var i = 0; i < listOfStates.length; i++) {
        var stateInput = []; //array for the next state of a particular state
        var stateVariableInput = []; //array for the variable being consume by a particular state

        //loop to see the next state based on the variables
        for (var j = 0; j <= listOfVariables.length; j++) {
            if (j != 0) {
                //read data from the transition table
                var stateTransitionData = document.getElementById('tableInput' + i + j).value.toUpperCase();
                //if the state have more than one next state
                if (stateTransitionData != '∅' && stateTransitionData != "" && stateTransitionData.length > 1) {
                    var stateTransitionDataNoComma = stateTransitionData.replace(/,/g, '');
                    for (var x = 0; x < stateTransitionDataNoComma.length; x++) {
                        stateVariableInput.push(listOfVariables[j - 1]);
                        stateInput.push(stateTransitionDataNoComma[x]);
                    }
                }
                //if the state have only one next state
                if (stateTransitionData != '∅' && stateTransitionData != "" && stateTransitionData.length <= 1) {
                    stateVariableInput.push(listOfVariables[j - 1]);
                    stateInput.push(stateTransitionData);
                }
            }
        }

        console.log(stateInput);
        console.log(stateVariableInput);

        //if the next state of a particular state is present
        if (stateInput.length != 0) {
            regularGrammar += listOfStates[i] + ' &#8594 ';
            if (stateVariableInput[0] != "ε") {
                regularGrammar += stateVariableInput[0] + stateInput[0];
            }
            else {
                regularGrammar += stateInput[0];
            }
        }
        console.log(regularGrammar);
        //loop to get the variables being consume when the state proceed to the next state
        for (var k = 1; k < stateInput.length; k++) {
            if (stateVariableInput[k] != "ε") {
                regularGrammar += ' | ' + stateVariableInput[k] + stateInput[k];
            }
            else {
                regularGrammar += ' | ' + stateInput[k];
            }
        }
        console.log(regularGrammar);
        //if the state is the final state with no other next state or variables
        if (listOfFinalStates.includes(listOfStates[i]) && stateInput.length == 0) {
            regularGrammar += listOfStates[i] + '&#8594 ε';
        }
        //if the state is the final state but with other next state or variables
        else if (listOfFinalStates.includes(listOfStates[i])) {
            regularGrammar += ' | ε';
        }
        else {
            regularGrammar += "";
        }
        regularGrammar += '<br>';
        console.log(regularGrammar);
    }

    // Validation logic:
    var hasInvalidContent = false;
    for (var i = 0; i < listOfStates.length; i++) {
        for (var j = 1; j <= listOfVariables.length; j++) { // Start from 1 to skip the first column
            var cellValue = document.getElementById('tableInput' + i + j).value.toUpperCase();
            if (!listOfStates.includes(cellValue) && !listOfVariables.includes(cellValue) && cellValue !== '∅') {
                hasInvalidContent = true;
                break; // Exit the inner loop if invalid content is found
            }
        }
        if (hasInvalidContent) {
            break; // Exit the outer loop if invalid content is found
        }
    }
    const errorMessageElement2 = document.getElementById('error-message2');
    errorMessageElement2.innerHTML = "";
    if (hasInvalidContent) {

        errorMessageElement2.innerHTML = "*Invalid content found in the transition table. Please ensure it matches the NFA input.";
        return; // Stop the conversion if invalid content is present
    }

    document.getElementById('rg-table').innerHTML = regularGrammar;
}

function getVariablesNFA() {
    listOfVariables = [];
    var stringVariables = document.getElementById('string-variables').value;
    var stringVariablesNoComma = stringVariables.replace(/,/g, '');

    for (var i = 0; i < stringVariablesNoComma.length; i++) {
        listOfVariables.push(stringVariablesNoComma[i]);
    }

    console.log(listOfVariables);
}

function getStatesNFA() {
    listOfStates = [];
    var stringStates = document.getElementById('string-states').value.toUpperCase();
    var stringStatesNoComma = stringStates.replace(/,/g, '');

    for (var i = 0; i < stringStatesNoComma.length; i++) {
        listOfStates.push(stringStatesNoComma[i]);
    }

    console.log(listOfStates);
}

function getStartStateNFA() {
    startState = "";
    const inputValue = document.getElementById('string-start-state').value.toUpperCase();
    const errorMessageElement = document.getElementById('error-message');

    // Validation logic: accept only single character A-Z
    if (!/^[A-Z]$/.test(inputValue)) {
        errorMessageElement.innerHTML = "*Invalid START state! Please enter a single uppercase letter.";
        return; // Stop function execution if invalid input
    }

    startState = inputValue;
    errorMessageElement.innerHTML = ""; // Clear any previous error messages
    console.log(startState);
}


function getFinalStatesNFA() {
    listOfFinalStates = [];
    var stringFinalStates = document.getElementById('string-final-states').value.toUpperCase();
    var stringFinalStatesNoComma = stringFinalStates.replace(/,/g, '');

    for (var i = 0; i < stringFinalStatesNoComma.length; i++) {
        listOfFinalStates.push(stringFinalStatesNoComma[i]);
    }

    console.log(listOfFinalStates);
}

function generateTable() {
    //clear the existing table content
    document.getElementById('transition-table-nfa').innerHTML = "";

    //Get NFA information
    getVariablesNFA();
    getStatesNFA();
    getFinalStatesNFA();
    getStartStateNFA();

    //Build the table
    var tableBody = "";
    document.getElementById('transition-table-nfa').innerHTML = tableBody;
    tableBody += '<tr>';
    tableBody += '<td>' + '' + '</td>';

    //Populate the header cells with variables
    for (var i = 0; i < listOfVariables.length; i++) {
        tableBody += '<td>' + listOfVariables[i] + '</td>';
    }
    tableBody += '</tr>'

    //Construct rows for each state 
    for (var i = 0; i < listOfStates.length; i++) {
        tableBody += '<tr>';

        for (var j = 0; j <= listOfVariables.length; j++) {
            if (j != 0) {
                tableBody += '<td>' + '<input type="text" id="tableInput' + i + j + '"size="1" value="∅" maxlength="10">';
            }
            else {
                if (listOfStates[i] == startState) {
                    tableBody += '<td>' + '>' + listOfStates[i] + '</td>';
                }
                else if (listOfFinalStates.includes(listOfStates[i])) {
                    tableBody += '<td>' + '*' + listOfStates[i] + '</td>';
                }
                else {
                    tableBody += '<td>' + listOfStates[i] + '</td>';
                }
            }
        }
        tableBody += '</tr>'
    }
    //Set the generated table to the specified HTML element
    document.getElementById('transition-table-nfa').innerHTML = tableBody;
}

function getStringToCheck() {
    document.getElementById('string-to-check').innerHTML = "";
    var listOfStringToCheck = getInput('string-to-check');
    var checkResult = "";

    for (var i = 0; i < listOfStringToCheck.length; i++) {
        checkResult += checkString(listOfStringToCheck[i]) + "\n";
        console.log(checkResult);
    }
    document.getElementById('string-check-result').innerHTML = checkResult;
}

function checkString(stringToCheck) {
    var result = "NO";
    var cont = true;
    var process = true;
    var nextState = startState;
    //loop according to the string length
    for (var i = 0; i < stringToCheck.length; i++) {
        process = true;
        result = "NO"
        //loop based on the states
        for (var j = 0; j < listOfStates.length; j++) {
            //if the state match with the next state, process string and continue read is true
            if (listOfStates[j] == nextState && process == true && cont == true) {
                cont = false;
                var stateInput = [];
                var stateVariableInput = [];
                for (var k = 0; k <= listOfVariables.length; k++) {
                    if (k != 0) {
                        var stateTransitionData = document.getElementById('tableInput' + j + k).value.toUpperCase();
                        if (stateTransitionData != '∅' && stateTransitionData != "" && stateTransitionData.length > 1) {
                            var stateTransitionDataNoComma = stateTransitionData.replace(/,/g, '');
                            for (var y = 0; y < stateTransitionDataNoComma.length; y++) {
                                stateVariableInput.push(listOfVariables[k - 1]);
                                stateInput.push(stateTransitionDataNoComma[y]);
                            }
                        }
                        if (stateTransitionData != '∅' && stateTransitionData != "" && stateTransitionData.length <= 1) {
                            stateVariableInput.push(listOfVariables[k - 1]);
                            stateInput.push(stateTransitionData);
                        }
                    }
                }
                //loop according to the variables from the table
                for (var x = 0; x < stateVariableInput.length; x++) {
                    //if the part of the string match with the variables
                    if (stringToCheck[i] == stateVariableInput[x]) {
                        nextState = stateInput[x]; //change the next state based on the variables being consumed
                        //if the next state match with final state after previous variables being true
                        if (listOfFinalStates.includes(nextState)) {
                            result = "OK";
                        }
                        else {
                            result = "NO";
                        }
                        cont = true;
                    }
                }
                process = false;
            }
        }
    }
    return result;
}
function getVariablesNFA() {
    listOfVariables = [];
    var stringVariables = document.getElementById('string-variables').value;
    var stringVariablesNoComma = stringVariables.replace(/,/g, '');

    for (var i = 0; i < stringVariablesNoComma.length; i++) {
        listOfVariables.push(stringVariablesNoComma[i]);
    }

    console.log(listOfVariables);
}

function getStatesNFA() {
    listOfStates = [];
    var stringStates = document.getElementById('string-states').value.toUpperCase();
    var stringStatesNoComma = stringStates.replace(/,/g, '');

    for (var i = 0; i < stringStatesNoComma.length; i++) {
        listOfStates.push(stringStatesNoComma[i]);
    }

    console.log(listOfStates);
}

function getStartStateNFA() {
    startState = "";
    const inputValue = document.getElementById('string-start-state').value.toUpperCase();
    const errorMessageElement = document.getElementById('error-message');

    // Validation logic: accept only single character A-Z
    if (!/^[A-Z]$/.test(inputValue)) {
        errorMessageElement.innerHTML = "*Invalid START state! Please enter a single uppercase letter.";
        return; // Stop function execution if invalid input
    }

    startState = inputValue;
    errorMessageElement.innerHTML = ""; // Clear any previous error messages
    console.log(startState);
}


function getFinalStatesNFA() {
    listOfFinalStates = [];
    var stringFinalStates = document.getElementById('string-final-states').value.toUpperCase();
    var stringFinalStatesNoComma = stringFinalStates.replace(/,/g, '');

    for (var i = 0; i < stringFinalStatesNoComma.length; i++) {
        listOfFinalStates.push(stringFinalStatesNoComma[i]);
    }

    console.log(listOfFinalStates);
}

function generateTable() {
    //clear the existing table content
    document.getElementById('transition-table-nfa').innerHTML = "";

    //Get NFA information
    getVariablesNFA();
    getStatesNFA();
    getFinalStatesNFA();
    getStartStateNFA();

    //Build the table
    var tableBody = "";
    document.getElementById('transition-table-nfa').innerHTML = tableBody;
    tableBody += '<tr>';
    tableBody += '<td>' + '' + '</td>';

    //Populate the header cells with variables
    for (var i = 0; i < listOfVariables.length; i++) {
        tableBody += '<td>' + listOfVariables[i] + '</td>';
    }
    tableBody += '</tr>'

    //Construct rows for each state 
    for (var i = 0; i < listOfStates.length; i++) {
        tableBody += '<tr>';

        for (var j = 0; j <= listOfVariables.length; j++) {
            if (j != 0) {
                tableBody += '<td>' + '<input type="text" id="tableInput' + i + j + '"size="1" value="∅" maxlength="10">';
            }
            else {
                if (listOfStates[i] == startState) {
                    tableBody += '<td>' + '>' + listOfStates[i] + '</td>';
                }
                else if (listOfFinalStates.includes(listOfStates[i])) {
                    tableBody += '<td>' + '*' + listOfStates[i] + '</td>';
                }
                else {
                    tableBody += '<td>' + listOfStates[i] + '</td>';
                }
            }
        }
        tableBody += '</tr>'
    }
    //Set the generated table to the specified HTML element
    document.getElementById('transition-table-nfa').innerHTML = tableBody;
}

function getStringToCheck() {
    document.getElementById('string-to-check').innerHTML = "";
    var listOfStringToCheck = getInput('string-to-check');
    var checkResult = "";

    for (var i = 0; i < listOfStringToCheck.length; i++) {
        checkResult += checkString(listOfStringToCheck[i]) + "\n";
        console.log(checkResult);
    }
    document.getElementById('string-check-result').innerHTML = checkResult;
}

function checkString(stringToCheck) {
    var result = "NO";
    var cont = true;
    var process = true;
    var nextState = startState;
    //loop according to the string length
    for (var i = 0; i < stringToCheck.length; i++) {
        process = true;
        result = "NO"
        //loop based on the states
        for (var j = 0; j < listOfStates.length; j++) {
            //if the state match with the next state, process string and continue read is true
            if (listOfStates[j] == nextState && process == true && cont == true) {
                cont = false;
                var stateInput = [];
                var stateVariableInput = [];
                for (var k = 0; k <= listOfVariables.length; k++) {
                    if (k != 0) {
                        var stateTransitionData = document.getElementById('tableInput' + j + k).value.toUpperCase();
                        if (stateTransitionData != '∅' && stateTransitionData != "" && stateTransitionData.length > 1) {
                            var stateTransitionDataNoComma = stateTransitionData.replace(/,/g, '');
                            for (var y = 0; y < stateTransitionDataNoComma.length; y++) {
                                stateVariableInput.push(listOfVariables[k - 1]);
                                stateInput.push(stateTransitionDataNoComma[y]);
                            }
                        }
                        if (stateTransitionData != '∅' && stateTransitionData != "" && stateTransitionData.length <= 1) {
                            stateVariableInput.push(listOfVariables[k - 1]);
                            stateInput.push(stateTransitionData);
                        }
                    }
                }
                //loop according to the variables from the table
                for (var x = 0; x < stateVariableInput.length; x++) {
                    //if the part of the string match with the variables
                    if (stringToCheck[i] == stateVariableInput[x]) {
                        nextState = stateInput[x]; //change the next state based on the variables being consumed
                        //if the next state match with final state after previous variables being true
                        if (listOfFinalStates.includes(nextState)) {
                            result = "OK";
                        }
                        else {
                            result = "NO";
                        }
                        cont = true;
                    }
                }
                process = false;
            }
        }
    }
    return result;
}
