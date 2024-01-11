class State
{
	constructor(name) {
		this.name = name;
		this.directState = [];
		this.isFinalState = false;
		this.isInitialState = false;
		this.output = {};
	}

    setInitialState() {
        this.isInitialState = true;
    }
	
	setFinalState() {
        this.isFinalState = true;
    }

	setOutput(input) {
		input.forEach(i => (this.output[i] = []));
	}
	
	addDirectState(state) {
		if (!this.directState.includes(state))
		{
			this.directState.push(state);
			this.directState.sort();
		}
	}
}

class NfaWithEpsilon
{
	constructor(grammars = []) {
		this.states = [];
		this.finalStates = [];
		this.inputWithEpsilon = [];
		this.grammars = [];
        this.arrWithEpsilon = [];

        this.initializeNFA(grammars);
        this.grammars = grammars.sort();
		this.inputWithEpsilon.sort();
        this.inputWithEpsilon.push('\u03B5'); // ε
        this.states.sort((a, b) => a.name.localeCompare(b.name));
        this.generateTableInfo();
    }
		
    initializeNFA(grammars) {
        for (const grammarRule of grammars) {
            const [currentState] = grammarRule.split("->");
            this.states.push(new State(currentState));
        }
        this.states[0].setInitialState();
        this.extractGrammarState(grammars);
        this.initializeOutputStates(grammars);
    }

    extractGrammarState(grammars) {
        for (const grammarRule of grammars) {
            const [currentState, processes] = grammarRule.split("->");
            const processesArray = processes.split("|");

            processesArray.forEach((process) => {
                if (process.length > 1) {
                    if (!this.inputWithEpsilon.includes(process[0]))
                        this.inputWithEpsilon.push(process[0]);
                } 
                else if (process === '\u03B5') { // ε
                    this.finalStates.push(currentState);
                    const foundState = this.states.find(state => state.name === currentState);
                    if (foundState)
                        foundState.setFinalState();
                } 
                else {
                    const foundState = this.states.find(state => state.name === currentState);
                    if(foundState) 
                        foundState.addDirectState(process);
                }
            });
        }
    }

    initializeOutputStates(grammars) {
        for (const state of this.states) 
            state.setOutput(this.inputWithEpsilon);
        
        for (const grammarRule of grammars) {
            const [currentState, processes] = grammarRule.split("->");
            const processesArray = processes.split("|");
            processesArray.forEach((process) => {
                if (process.length > 1) {
                    const foundState = this.states.find(state => state.name === currentState);
                    if(foundState) 
                        foundState.output[process[0]].push(process[1]);
                    console.log(foundState.name);
                    console.log(foundState.output);
                }
            });
        }
    }

    generateTableInfo()	{
		this.arrWithEpsilon = [];
		for (let i = 0; i < this.states.length; i++) {
			this.arrWithEpsilon[i] = [];
			
			for (var j = 0; j < this.inputWithEpsilon.length; j++) { 
				// Initialize each cell with the empty set symbol
				this.arrWithEpsilon[i][j] = '\u2205';
				// Check if it's not the epsilon symbol
				if (j !== this.inputWithEpsilon.length - 1) {
					var nextState = this.states[i].output[this.inputWithEpsilon[j]];
					if (nextState.length != 0) {
						nextState.sort();
						this.arrWithEpsilon[i][j] = nextState.toString()
					}
				}
				else {
					if (this.states[i].directState.length != 0)
						this.arrWithEpsilon[i][j] = this.states[i].directState.toString();
				}
			}
		}
    }

    getStatesNames() {
        return this.states.map(state => state.name);
    }
	
	getDetails() {
        const M = `M = (Q,${'\u03A3'},${'\u03B4'},p\u2080,F)`;
        const Q = `Q = {${this.getStatesNames().sort().join(",")}}`;
        const sigma = `${'\u03A3'} = {${this.inputWithEpsilon.slice(0, -1).sort().join(",")}}`;
        const transitionFunction = `${'\u03B4'}: Q x ${'\u03A3'}${'\u03B5'} -> Pow(Q)`;
        const p0 = `p\u2080 = ${this.states[0].name}`;
        const F = `F = {${this.finalStates.sort().join(",")}}`;
        return `${M}\n${Q}\n${sigma}\n${transitionFunction}\n${p0}\n${F}`;
    }

    isAcceptable(input) {
        const initialState = this.states.find(state => state.isInitialState);
        if (input === '\u03B5') 
            return (initialState.isFinalState);
        else
            return this.checkInput(initialState, input, 0);
    }

	checkInput(currentState,input,inputIndex) {
        if (currentState.isFinalState && inputIndex === input.length)
            return true;
        
        else if (inputIndex === input.length) {
            return currentState.directState.some(directState => {
                const nextState = this.states.find(state => state.name === directState);
                return nextState && this.checkInput(nextState, input, inputIndex);
            });
        } 
        else {
            let pass = false;
            // Check regular input
            const outputStates = currentState.output[input[inputIndex]];
    
            if (outputStates) {
                for (const nextStateName of outputStates) {
                    const nextState = this.states.find(state => state.name === nextStateName);
    
                    if (nextState && this.checkInput(nextState, input, inputIndex + 1))
                        pass = true;
                }
            }
			
			// Check epsilon
			for (const directState of currentState.directState) {
                const nextState = this.states.find(state => state.name === directState);

                if (nextState && this.checkInput(nextState, input, inputIndex))
                    pass = true;
            }
            return pass;
		}
	}
}

class NfaWithoutEpsilon {
    constructor(grammars = []) {
        const nfaWithE = new NfaWithEpsilon(grammars);

        this.states = [...nfaWithE.states];
        this.finalStates = [...nfaWithE.finalStates];
        this.initialState = this.states[0].name;
        this.inputWOEpsilon = [...nfaWithE.inputWithEpsilon].slice(0, -1); // Remove epsilon
        this.grammars = [...nfaWithE.grammars];

        this.arrWOEpsilon = Array.from({ length: this.states.length }, () =>
            Array(this.inputWOEpsilon.length).fill('\u2205')  // Fill with empty set symbol
        );

        this.populateTable();

		// Check whether the initial states can be final states due to epsilon
        if (this.checkFinalState(this.states[0])) {
            this.finalStates.push(this.states[0].name);
            this.states[0].isFinalState = true;
        }
    }

    populateTable() {
        for (let i = 0; i < this.states.length; i++) {
            for (let j = 0; j < this.inputWOEpsilon.length; j++) {
                const tempNextState = this.getOutput([], this.states[i], this.inputWOEpsilon[j]).sort();

                if (tempNextState.length !== 0) {
                    this.arrWOEpsilon[i][j] = tempNextState.toString();
                }
            }
        }
    }

    getOutput(tempNextState, currentState, currentInput) {
        const outputState = currentState.output[currentInput];

        for (const output_state of outputState) {
            if (!tempNextState.includes(output_state)) {
                tempNextState.push(output_state);
                tempNextState = this.checkDirectState(tempNextState, this.getStateByName(output_state));
            }
        }

        for (const directState of currentState.directState) 
            tempNextState = this.getOutput(tempNextState, this.getStateByName(directState), currentInput);
        
        return tempNextState;
    }

    checkDirectState(tempNextState, currentState) {
        for (const directState of currentState.directState) {
            if (!tempNextState.includes(directState)) {
                tempNextState.push(directState);
                tempNextState = this.checkDirectState(tempNextState, this.getStateByName(directState));
            }
        }
        return tempNextState;
    }

    checkFinalState(currentState) {
        for (const directState of currentState.directState) {
            if (this.checkFinalState(this.getStateByName(directState)))
                return true;
        }
        return currentState.isFinalState;
    }

    getStateByName(name) {
        return this.states.find(state => state.name === name);
    }
}

function createTransitionTable(tableId, titleId, nfa) {
    var table = document.getElementById(tableId);
    var tableTitle = document.getElementById(titleId);

    table.innerHTML = '';
    tableTitle.innerHTML = '';
    let withEpsilon = "";

    if (tableId == 'transitionTableWOEpsilon'){
        tableTitle.innerHTML = 'Transition Table W/O Epsilon';
        withEpsilon = "WOEpsilon";
    }
    else{
        tableTitle.innerHTML = 'Transition Table';
        withEpsilon = "WithEpsilon";
    }

    // Create header
    var row = table.insertRow(0);
    var cell = row.insertCell(0);
    cell.innerHTML = '\u03B4' + "NFA"; // δNFA 

    nfa['input'+withEpsilon].forEach((symbol,index) => {
        cell = row.insertCell(index+1);
        cell.innerHTML = symbol;
    });

    // Insert each row
    nfa.states.forEach((state, i) => {
        row = table.insertRow(-1);  // Insert at the last
        cell = row.insertCell(0);
        if (state.isFinalState && state.isInitialState)
            cell.innerHTML = '\u2192' + "*" + state.name;
        else if (state.isFinalState)
            cell.innerHTML = "*" + state.name;
        else if (state.isInitialState)
            cell.innerHTML = '\u2192' + state.name;
        else
            cell.innerHTML = state.name;
        
        for (var j = 0; j < nfa['input'+withEpsilon].length; j++) {
            cell = row.insertCell(j+1);
            cell.innerHTML = "{" + nfa['arr'+withEpsilon][i][j] + "}";
        }
    });
}

function createTestStringsTable(input, acceptance) {
    var table = document.getElementById("testStringsTable");

    table.innerHTML = '';

    var row = table.insertRow(0);
    var cell = row.insertCell(0);
    cell.innerHTML = "<strong>Input String</strong>";
    cell = row.insertCell(1);
    cell.innerHTML = "<strong>Acceptable?</strong>";

    input.forEach((string, i) =>{
        row = table.insertRow(-1);
        cell = row.insertCell(0);
        cell.innerHTML = string;
        cell = row.insertCell(1);
        if (acceptance[i])
            cell.innerHTML = "Yes";
        else
            cell.innerHTML = "No";
    });
}

function convertRgToNFA() {
    var rgInput = document.getElementById('rg-input').value.split('\n');
    const nfaWithEpsilon = new NfaWithEpsilon(rgInput);
    const nfaWOEpsilon = new NfaWithoutEpsilon(rgInput);
    document.getElementById("outputNfaInfo").innerText = nfaWithEpsilon.getDetails();
	createTransitionTable("transitionTableEpsilon", "tableWETitle", nfaWithEpsilon);
	createTransitionTable("transitionTableWOEpsilon", "tableWOETitle", nfaWOEpsilon);
    return nfaWithEpsilon;
}

function checkStrings() {
	var testStringsInput = document.getElementById("test-string-input").value.split('\n');
    var acceptance = [];
	const nfa = convertRgToNFA();
    testStringsInput.forEach((inputString) =>{
        acceptance.push(nfa.isAcceptable(inputString));
    });
    createTestStringsTable(testStringsInput, acceptance);
}

function clearText() {
    document.getElementById("rg-input").value = "";
    document.getElementById("test-string-input").value = "";
    document.getElementById("outputNfaInfo").innerText = "";
    document.getElementById("transitionTableEpsilon").innerHTML = '';
    document.getElementById("transitionTableWOEpsilon").innerHTML = '';
    document.getElementById("testStringsTable").innerHTML = '';
    document.getElementById("tableWETitle").innerHTML = '';
    document.getElementById("tableWOETitle").innerHTML = '';
}

function main() {
    document.getElementById("defaultOpen").click();
    document.getElementById("clearBtn").addEventListener("click", clearText);
    document.getElementById("rgToNFABtn").addEventListener("click", convertRgToNFA);
    document.getElementById("checkStringsBtn").addEventListener("click", checkStrings);
}

main()