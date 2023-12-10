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
		for(let i of input) {
			this.output[i] = [];
		}
	}
	
	addDirectState(state) {
		if (!this.directState.includes(state))
		{
			this.directState.push(state);
			this.directState.sort();
		}
	}
}

class NFA_with_epsilon
{
	constructor(grammars = []) {
		this.states = [];
		this.finalStates = [];
		this.input_with_epsilon = [];
		this.grammars = [];
        this.arr_with_epsilon = [];

        this.initializeStates(grammars);
        this.extractGrammarState(grammars);
        this.initializeOutputStates(grammars);

        this.grammars = grammars.sort();
		this.input_with_epsilon.sort();
        this.input_with_epsilon.push('\u03B5'); // ε
        this.states.sort((a, b) => a.name.localeCompare(b.name));
        this.generateTableInfo();
    }
		
    initializeStates(grammars) {
        for (const grammarRule of grammars) {
            const [currentState] = grammarRule.split("->");
            this.states.push(new State(currentState));
        }
        this.states[0].setInitialState();
    }

    extractGrammarState(grammars) {
        for (const grammarRule of grammars) {
            const [currentState, processes] = grammarRule.split("->");
            const processesArray = processes.split("|");

            processesArray.forEach((process) => {
                if (process.length > 1) {
                    if (!this.input_with_epsilon.includes(process[0]))
                        this.input_with_epsilon.push(process[0]);
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
            state.setOutput(this.input_with_epsilon);
        
        for (const grammarRule of grammars) {
            const [currentState, processes] = grammarRule.split("->");
            const processesArray = processes.split("|");
            processesArray.forEach((process) => {
                if (process.length > 1) {
                    const foundState = this.states.find(state => state.name === currentState);
                    if(foundState) 
                        foundState.output[process[0]].push(process[1]);
                }
            });
        }
    }

    generateTableInfo()	{
		this.arr_with_epsilon = [];
		for (var i = 0; i < this.states.length; i++) {
			this.arr_with_epsilon[i] = [];
			
			for (var j=0; j<this.input_with_epsilon.length; j++) { 
				// Initialize each cell with the empty set symbol
				this.arr_with_epsilon[i][j] = '\u2205';
				// Check if it's not the epsilon symbol
				if (j !== this.input_with_epsilon.length - 1) {
					var nextState = this.states[i].output[this.input_with_epsilon[j]];
					if (nextState.length != 0) {
						nextState.sort();
						this.arr_with_epsilon[i][j] = nextState.toString()
					}
				}
				else {
					if (this.states[i].directState.length != 0)
						this.arr_with_epsilon[i][j] = this.states[i].directState.toString();
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
        const sigma = `${'\u03A3'} = {${this.input_with_epsilon.slice(0, -1).sort().join(",")}}`;
        const transitionFunction = `${'\u03B4'}: Q x ${'\u03A3'}${'\u03B5'} -> Pow(Q)`;
        const p0 = `p\u2080 = ${this.states[0].name}`;
        const F = `F = {${this.finalStates.sort().join(",")}}`;
        return `${M}\n${Q}\n${sigma}\n${transitionFunction}\n${p0}\n${F}`;
    }
}

function createTable(nfa) {
    var table = document.getElementById("transitionTableEpsilon");
    var tableTitle = document.getElementById("tableWETitle");

    table.innerHTML = '';
    tableTitle.innerHTML = '';

    tableTitle.innerHTML = 'Transition Table';

    // Create header
    var row = table.insertRow(0);
    var cell = row.insertCell(0);
    cell.innerHTML = '\u03B4' + "NFA"; // δNFA 

    nfa.input_with_epsilon.forEach((symbol,index) => {
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
        
        for (var j = 0; j < nfa.input_with_epsilon.length; j++) {
            cell = row.insertCell(j+1);
            cell.innerHTML = "{" + nfa.arr_with_epsilon[i][j] + "}";
        }
    });
}

function convertRgToNFA() {
    var rgInput = document.getElementById('rg-input').value.split('\n');
    const nfa = new NFA_with_epsilon(rgInput);
    document.getElementById("outputNfaInfo").innerText = nfa.getDetails();
	createTable(nfa);
}

// function checkStrings() {
//     var rgInput = document.getElementById('rg-input').value.split('\n');
// 	var testStringsInput = document.getElementById("test-string-input").value.split('\n');
    
// }

function clearText() {
    document.getElementById("rg-input").value = "";
    document.getElementById("test-string-input").value = "";
    document.getElementById("outputNfaInfo").innerText = "";
    document.getElementById("transitionTableEpsilon").innerHTML = '';
    document.getElementById("transitionTableWOEpsilon").innerHTML = '';
    document.getElementById("tableWETitle").innerHTML = '';
    document.getElementById("tableWOETitle").innerHTML = '';
}

function main() {
    document.getElementById("defaultOpen").click();
    document.getElementById("clearBtn").addEventListener("click", clearText);
    document.getElementById("rgToNFABtn").addEventListener("click", convertRgToNFA);
}

main()