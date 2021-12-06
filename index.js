#!/usr/bin/env node
const process = require('process');
const fs = require('fs');
const { spawn } = require('child_process');
const prompt = require('prompt');
console.log("Sample CLI");

const commands = {};//object holds all commands as attribtues

//Command class is a template for creating commands
class Command {
    constructor(name, desc, func){
        this.func = func;
        this.desc = desc;
        commands[name] = this;//add command to commands obj
    }
    //function for executing the command
    run(cmd){ this.func(cmd) }
}

//Primary function to kick off this script
function runCommand(cmd){
    try{
        commands[cmd[2]].run(cmd);
    }catch(err){
        if(err.message == 'Cannot read property \'run\' of undefined')        {
            console.log(`No such command \'${cmd[2]}\'. Try help for options`);
        console.log(err.message);
        }
    }
}

//help function - lists all commands and their desc
new Command("help", "list all commands and their descriptions",
    function(){
        //loop through and print command names and desc
        let keys = Object.keys(commands);
        keys.forEach(key => console.log(`${key}: ${commands[key].desc}`))
    });


//AWS Environment Login
var config = `{profile:"",region:"",asg:"",arn:"",cluster:""}`;
//Check to see if config file exists. If not, create one
console.log("Searching for config file..");

function writeConfigFile(data){
    //create new file
    fs.writeFile("./config", data, (err)=>{
        if(err){
            console.log(err)
        }else{
            console.log("config file written");
            //try loading again
            loadConfig();
        }
    }
    );
}
function loadConfig(backUpData){
    //look for exsting config file
    fs.readFile('./config', (err, data) => {
        if(err?.message == `ENOENT: no such file or directory, open './config'`){
            writeConfigFile(backUpData);
        }else{
            //Load existing config file
            console.log("..found")
            console.log("loading config..");
            try{
                config = JSON.parse(data);
            }catch(err){console.log("Error loading config.."); console.log(err)}
        }
    }); 
};

loadConfig(config);

const configDefaults = [
    {name:"dev-east", value: { }}
]

//getConfig - show the current configuration for aws
new Command("getConfig", "show the current configuration for aws",
    ()=>{console.log(JSON.stringify(config))});

//setConfig - Set config to one of the hardcoded defaults to fill AWS params
new Command("setConfig", "Set config to one of hardcoded defaults to fill AWS params",
    function(){
        //Show existing defaults
        console.log("Choose a config..");
        configDefaults.forEach((config,i) => {console.log(`${i}: ${config.name}`)});
        
        //User enters number for desired config to set
        prompt.start();
        prompt.get(['config'], (err, choice)=>{
            if(configDefaults.length > choice && choice >= 0){
                let configString = JSON.Stringify(configDefaults[choice].value);
                writeConfigFile(configString);
            }
        });
    });
                

runCommand(process.argv);
