let userGuess = "";
let compGuess = "";
let request = "";

// delay for use in setInterval() to disable the check button
// it was chosen by trials in order the browser had time to 
// reflect the changes on a screen
// proved in Chrome and Firefox
let delay = 100;

function startUserGame() {
    if (userGuess) {
        document.getElementById("info").innerHTML += '<p class="msgUG"> The game is over. The puzzle was ' + userGuess.puzzle + '</p>';
        userGuess = "";
    }
    userGuess = new UserGame();
    document.getElementById("info").innerHTML += '<p class="msgUG"> The User guessing game has been started.</p>';
    document.getElementById("userNumber").focus();
    // input_entry.focus()
}

function checkRequest() {
    if (!userGuess) {
        document.getElementById("info").innerHTML += '<p class="msgUG"> Push "New game".</p>';            
        return;
    }
    let trial = document.getElementById("userNumber").value;
    let result = "";
    try {
        trial = userGuess.check(trial);
        result = getResponse(userGuess.puzzle, trial);
        userGuess.gameRequests.push(trial);
        userGuess.gameResponses.push(result);
        let index = userGuess.gameRequests.length;
        if (result == 'B4 C0') {
            document.getElementById("info").innerHTML += '<p class="msgUG"> You have guessed in ' + index + ' move(s).</p>';                
            userGuess = "";
            return;
        } else document.getElementById("info").innerHTML += '<p class="msgUG"> Attempt ' + index + '. ' + userGuess.gameRequests[index-1] + ' : ' + userGuess.gameResponses[index-1] + '</p>';
    } catch(error) {
        document.getElementById("info").innerHTML += '<p class="msgUG">' + error.message + '</p>';
    }    
}

function startCompGame() {    
    compGuess = new CompGame();
    request = pickRiddle();
    let index = compGuess.gameRequests.length+1;
    document.getElementById("info").innerHTML += '<p class="msgCG"> The Computer guessing game has been started.</p>';
    document.getElementById("info").innerHTML += '<p class="msgCG"> Attempt ' + index + '. ' + request + '.</p>';
    document.getElementById("bulls").focus();
}

function checkInput() {    
    if (!compGuess) {
        document.getElementById("info").innerHTML += '<p class="msgCG"> Push "New game".</p>';            
        return;
    }
    
    let response = "B" + document.getElementById("bulls").value  + " " + "C" + document.getElementById("cows").value;
    
    try {
        compGuess.check(response);        
    } catch (error) {
        document.getElementById("info").innerHTML += '<p class="msgCG">' + error.message + '</p>';
        return;
    }
    
    compGuess.gameRequests.push(request);
    compGuess.gameResponses.push(response);

    let index = compGuess.gameRequests.length;
    document.getElementById("info").innerHTML += '<p class="msgCG">' + index + '. ' + request + ': ' + response + '.</p>';
    index++;

    compGuess.generateRest();
            
    if (compGuess.rest.length == 0) {
        document.getElementById("info").innerHTML += '<p class="msgCG"> One of your responses was wrong. Let us start new game.</p>';
        compGuess = "";        
        return;
    }
        
    if (compGuess.rest.length == 1) {
        document.getElementById("info").innerHTML += '<p class="msgCG">' + index + '. The riddle is ' + compGuess.rest[0] + '.</p>';
        compGuess = "";        
        return;
    } else {
        // setInterval() to disable the check button to reflect the changes on a screen 
        // maybe it worth to try worker...

        let i = 0;
        let id = setInterval(frame, delay);
        function frame() {        
            if (i < 1) {
                document.getElementById("btn").innerHTML = "Wait. Thinking...";
                document.getElementById("btn").disabled = true;
                i++;            
            } else {
                clearInterval(id);
                request = compGuess.analyze();
                document.getElementById("btn").innerHTML = "Check input";
                document.getElementById("btn").disabled = false;
                document.getElementById("info").innerHTML += '<p class="msgCG"> Attempt ' + index + '. ' + request + '.</p>';
                document.getElementById("bulls").focus();
            }
        }
    }
}

function getResponse(riddle, attempt) {
    let bulls = 0
    let cows = 0
    for (let i=0; i<4; i++) {
        if (attempt[i] == riddle[i]) bulls += 1
        else if (riddle.search(attempt[i]) > -1) cows += 1
    }
    return 'B' + bulls.toString() + ' C' + cows.toString()           
}

function pickRiddle() {
    let numeric = "0123456789";
    let puzzle = "";
    while (puzzle.length != 4) {
        let i = Math.floor(Math.random() * numeric.length);
        let l = numeric.substr(i, 1);                
        puzzle += l;
        numeric = numeric.replace(l, "");
    }
    return puzzle
}

function UserGame() {
    this.gameLog = [];
    this.gameRequests = [];
    this.gameResponses = [];
    this.puzzle = pickRiddle();

    this.check = function(attempt) {
        let trial = ""
        let numeric = "0123456789";

        if (attempt.length != 4) throw TypeError("Symbols != 4.")

        for (let i=0; i<4; i++) {
            if (numeric.search(attempt[i]) < 0) throw TypeError("Symbols must be numeric.")
            if (trial.search(attempt[i]) < 0) trial += attempt[i]
            else throw TypeError("Symbols must be different.")
        }

        if (this.gameRequests.includes(trial)) throw TypeError("The number has been checked already.")

    return trial
    }
}

function CompGame() {
    this.gameRequests = [];
    this.gameResponses = [];

    this.full = generate_full();
    this.rest = this.full.slice();
    this.getResponse = getResponse;

    this.check = function(attempt) {
        let result = "";
        const right = ['B4 C0', 'B3 C0',
                        'B2 C2', 'B2 C1', 'B2 C0',
                        'B1 C3', 'B1 C2', 'B1 C1', 'B1 C0',
                        'B0 C4', 'B0 C3', 'B0 C2', 'B0 C1', 'B0 C0']
        if (right.includes(attempt)) result = attempt
        else throw TypeError("Wrong input.")         
        
        return result
    }

    // generate function returns the list of all possible arrangements of 4 from 10 numeric symbols
    // return full: list of all possible arrangements of 4 from 10 numeric symbols with length 5040
    function generate_full() {
        let full = [];
        let numeric0 = "0123456789";

        for (i = 0; i < numeric0.length; i++) {
            numeric1 = numeric0.replace(numeric0[i], "");
            
            for (j = 0; j < numeric1.length; j++) {
                numeric2 = numeric1.replace(numeric1[j], "");

                for (k = 0; k < numeric2.length; k++) {
                    numeric3 = numeric2.replace(numeric2[k], "");

                    for (l = 0; l < numeric3.length; l++) {
                        full.push(numeric0[i] + numeric1[j] + numeric2[k] + numeric3[l])
                    }
                }
            }
        }
        return full
    }

    // generate function returns the list of all possible numeric which correspond to the gameResponses array
    // return result: the list of all possible string of 4 numeric symbols

    this.generateRest = function() {
        let restNew = [];
        let index =  this.gameRequests.length-1;
        let key = this.gameRequests[index];
        
        this.rest.forEach(element => {        
            if (getResponse(key, element) == this.gameResponses[index]) restNew.push(element);
        });
        // for (let i = 0; i < this.rest.length; i++) {
        //     let current = this.rest[i];
        //     document.getElementById("info").innerHTML += "<br>" + current;
        //     if (this.getResponse(key, current) == this.gameResponses[index]) restNew.push(current);
        // }
        this.rest = restNew;
    }

    // analyze function returns the array of the entries each of them is also array, e.g.:
    // [
    // ['1234', 338], <- the entry
    // ...
    // ['5678', 234]],
    // ...
    // ]
    // Each numeric of full array is checked against each numeric in rest array, then results are aggregated according their combinations ('B0 C1', 'B0 C2', etc.),
    // and maximum of all possible combinations is chosen to put into entry array.
    // :return analysis: the array of all possible numeric and maximum amount of possible responses for every entry.
    
    this.analyze = function() {

        let analysis = [];

        this.full.forEach(elementFromFull => {
            let entry = [];
            let amounts = [];
            let responses = [];

            let result = "";
            let index = 0;

            this.rest.forEach(elementFromRest => {
                result = getResponse(elementFromRest, elementFromFull);
                index = responses.indexOf(result);

                if (index >= 0) amounts[index] += 1
                else {
                    responses.push(result);
                    amounts.push(1);
                }
            
            });

            amounts.sort(function(a, b){return b - a});

            entry.push(elementFromFull);
            entry.push(amounts[0]);
            analysis.push(entry);            
        });
        let result = [];
        
        analysis.sort((a, b) => a[1] - b[1]);

        let minimum = analysis[0][1];      
        
        analysis.forEach(element => {
            if (element[1] == minimum) result.push(element[0]);
        });

        let priority = [];

        result.forEach(element => {
            if (this.rest.includes(element)) priority.push(element)
        })

        if (priority.length) result = priority

        let index = Math.floor(Math.random() * result.length);
        trial = result[index];
        return trial;        
    }

    
    // minFromMax function forms the optimal request based on the minimum of all maximums values
    // requires protection against empty rest array
    // :param analysis: the array from the analyze function
    // :return result: the array of all possible string of 4 numeric symbols with minimum of all maximum
    
    this.minFromMax = function(analysis) {
        let result = [];
        
        analysis.sort((a, b) => a[1] - b[1]);

        let minimum = analysis[0][1];      
        
        analysis.forEach(element => {
            if (element[1] == minimum) result.push(element[0]);
        });
        return result;
    }

    // suggest function get the next request for User to be checked
    // requires protection against empty rest array
    // The sequence is below:
    // 1. If game started, pick up random number;
    // 2. Check if rest array is empty => one of responses was wrong, terminate the game;
    // 3. if rest array contains 1 number => it's the riddle;
    // 4. Make the optimal list and pick up the random number from it.
    // :return trial: the next request of possible string of 4 numeric symbols

    this.suggest = function() {
        let trial = "";

        let optimalList = [];

        if (this.gameRequests.length == 0) trial = pickRiddle()
        else {
            this.generateRest();
            
            if (this.rest.length == 0) return '0'
                       
            if (this.rest.length == 1) trial = this.rest[0]
            else {


                analysis = this.analyze();
                optimalList = this.minFromMax(analysis);

                let priority = [];

                optimalList.forEach(element => {
                    if (this.rest.includes(element)) priority.push(element)
                })

                if (priority.length) optimalList = priority

                let index = Math.floor(Math.random() * optimalList.length);
                trial = optimalList[index];
            }
            
        }

        return trial;
    }
    
}
