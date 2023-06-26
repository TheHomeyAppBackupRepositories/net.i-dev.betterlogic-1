﻿"use strict";
const locale = require('locale-codes');

var variableManager = require('./lib/variablemanager.js');

//var util = require('./lib/util/util.js');
const { readFile: _readFile } = require('fs');
const { promisify } = require('util');
const { BL } = require("betterlogiclibrary");

const readFileAsync = promisify(_readFile);

async function readFile(path, ops) { return await readFileAsync(path, ops); }

const utcDate = "2023-03-15T12:13:27.952Z";

module.exports =
{
    async internal({ homey, body: { action } }) {
        switch (action) {
            case 'isLoaded':
                if (BL.isReady) return true;
                else {
                    try {
                        await BL.ready;
                        return true;
                    } catch (error) {
                        return BL.isReady;
                    }
                }
        }
    },
    async getLibrary({ homey, params }) {
        //homey.log('getLibrary', params, __dirname);
        try {
            if (params) switch (params.library) {
                case "bll": return { file: await readFile(__dirname + '/bll/bll.js', { encoding: 'utf8' }) };
                case "lodash": return { file: await readFile(__dirname + '/assets/js/lodash.min.js', { encoding: 'utf8' }) };
                case "mathjs": return { file: await readFile(__dirname + '/lib/util/math.js', { encoding: 'utf8' }) };
                case "datetime": return { file: await readFile(__dirname + '/bll/dateTime.js', { encoding: 'utf8' }) };
                case "number": return { file: await readFile(__dirname + '/bll/number.js', { encoding: 'utf8' }) };
                case "coding": return { file: await readFile(__dirname + '/bll/coding.js', { encoding: 'utf8' }) };
                case "proto": return { file: await readFile(__dirname + '/bll/proto.js', { encoding: 'utf8' }) };
                case "json": return { file: await readFile(__dirname + '/bll/json.js', { encoding: 'utf8' }) };
                case "write-excel-file-min": return { file: await readFile(__dirname + '/lib/write-excel-file-min.js', { encoding: 'utf8' }) };
                case "json2csv": return { file: await readFile(__dirname + '/lib/json2csv.js', { encoding: 'utf8' }) };
            }
            return null;
        } catch (error) {
            homey.error(error);
            throw error;
        }
    },
    async decode({ homey, body }) {
        return await homey.app.runCoding({ text: body.text, date: body.date, locale: body.locale, timeZone: body.timeZone });
    },
    async express({ homey, body: { expression, contextProperties } }) {
        for (const key in contextProperties) {
            if (Object.hasOwnProperty.call(contextProperties, key)) {
                if (contextProperties[key] && typeof (contextProperties[key]) == 'string' && contextProperties[key].match(/\d{4}-[0-1]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-6]\d.\d{3}Z/)) contextProperties[key] = new Date(contextProperties[key]);
            }
        }
        return await homey.app.runSandBox(expression, contextProperties);
    },

    async date({ homey, body }) {
        return await BL.datetime.toString(body.format, body.date, body.locale, body.timeZone);
    },

    async time({ homey, body }) {
        return await BL.datetime.toTimeString(body.format, body.timeMs, body.timeSec);
    },

    async getLocale({ homey }) {
        return await homey.app.locale;
    },

    async getExports({ homey }) {
        return await homey.app.exportsSettings;
    },
    async getVariablesDownloadUrl({ homey, params: { returnType } }) {
        let callback = (link) => {
            homey.api.realtime('downloadFileReady', link)
        };

        try {

            const vars = variableManager.getVariables();
            switch (returnType) {
                case 'csv':
                case 'csv_base64':
                    {
                        let filename = homey.app.exportsSettings && homey.app.exportsSettings.csvFilename ?
                            await BL.decode(homey.app.exportsSettings.csvFilename) :
                            "Vars " + BL.datetime.toString('datetimeshort') + '.csv';

                        const link = await BL.getDownloadUrl({ contentType: 'text/csv', filename });
                        homey.setTimeout(async () => {
                            await BL.setDownloadUrl({ link, text: await homey.app.getVariables({ returnType }), callback });
                        }, 0);
                        return link;
                    }
                    break;
                case 'xlsx':
                case 'xlsx_base64':
                    {
                        try {
                            let filename = homey.app.exportsSettings && homey.app.exportsSettings.xlsxFilename ?
                                await BL.decode(homey.app.exportsSettings.xlsxFilename) :
                                "Vars " + BL.datetime.toString('datetimeshort') + '.xlsx';

                            const link = await BL.getDownloadUrl({ contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename });
                            homey.setTimeout(async () => {
                                await BL.setDownloadUrl({ link, buffer: await homey.app.getVariables({ returnType }), callback });
                            }, 0);
                            return link;
                        } catch (error) {
                            homey.error(error);
                        }
                    }
                    break;
                case 'json': {
                    let filename = //false && //LET OP! false weg
                        homey.app.exportsSettings && homey.app.exportsSettings.jsonFilename ?
                            await BL.decode(homey.app.exportsSettings.jsonFilename) :
                            "Vars " + BL.datetime.toString('datetimeshort') + '.json';

                    const link = await BL.getDownloadUrl({ contentType: 'text/json', filename });
                    homey.setTimeout(async () => {
                        await BL.setDownloadUrl({ link, text: await homey.app.getVariables({ returnType }), callback });
                    }, 0);
                    return link;
                }
            }

            //return homey.app.getVariables({ returnType, callback });

        } catch (error) {
            //homey.error(error);
            let msg = error.message || error;
            if (msg.indexOf('App Not Ready') > -1) throw new Error(homey.__('bllNotRunning'));
        }
    },
    async getLocales({ homey }) {
        return await locale.all;
    },

    async getTimeZones({ homey }) {
        return homey.app.timezones;
    },
    async getVariable({ homey, params }) {
        if (params && params.variable) {
            if (params.variable.toLowerCase() === 'all') {
                return null, variableManager.getVariables();
            }
            var variable = variableManager.getVariable(params.variable);
            if (variable) {
                return { name: variable.name, type: variable.type, value: variable.value };
            }
        }
        return "Incorrect call";

    },
    async triggerVariable({ homey, params }) {
        if (params && params.variable) {

            var variable = variableManager.getVariable(params.variable);
            if (!variable) {
                throw new Error("Variable not found");
            }
            if (variable.type !== "trigger") {
                throw new Error("Only a trigger can be triggered");
            }

            await variableManager.updateVariable(variable.name, new Date().toISOString(), variable.type);
            return "OK";
        }
        throw new Error("Incorect call");

    },

    async setVariableAction({ homey, params }) {
        if (params && params.variable && params.value && params.action) {
            if (params.action.toLowerCase() !== 'i' && params.action.toLowerCase() !== 'd' &&
                params.action.toLowerCase() !== 'increment' && params.action.toLowerCase() !== 'decrement') {
                throw new Error("Invalid action. Specify increment or decrement.");
            }

            var variable = variableManager.getVariable(params.variable);
            if (!variable) {
                throw new Error("Variable not found");
            }
            if (variable.type !== "number") {
                throw new Error("Can only increment or decrement numbers");
            }
            if (params.action.toLowerCase() === "i" || params.action.toLowerCase() === "increment") {
                await variableManager.updateVariable(variable.name, variable.value + parseFloat(params.value), variable.type);
                return "OK";
            }
            if (params.action.toLowerCase() === "d" || params.action.toLowerCase() === "decrement") {
                await variableManager.updateVariable(variable.name, variable.value - parseFloat(params.value), variable.type);
                return "OK";
            }
            throw new Error("Incorect call");
        }
    },

    async setVariable({ homey, params }) {
        if (params && params.variable && params.value) {
            var variable = variableManager.getVariable(params.variable);
            if (variable) {
                if (variable.type === "boolean") {
                    if (params.value === "true" || params.value === "false" || params.value === "toggle") {

                        if (params.value === "toggle") {
                            var oldVariable = variableManager.getVariable(variable.name);
                            await variableManager.updateVariable(variable.name, (!oldVariable.value), variable.type);
                        } else {
                            await variableManager.updateVariable(variable.name, (params.value === 'true'), variable.type);
                        }
                        return "OK";
                    }
                    throw new Error("Incorrect value for boolean: " + params.value);
                }
                if (variable.type === "number") {
                    if (isNumber(params.value)) {
                        await variableManager.updateVariable(variable.name, parseFloat(params.value), variable.type);
                        return "OK";
                    }
                    throw new Error("Incorrect value for number: " + params.value);

                }
                if (variable.type === "string") {
                    if (typeof params.value === "string") {
                        await variableManager.updateVariable(variable.name, params.value, variable.type);
                        return "OK";
                    }
                    throw new Error("Incorrect value for string: " + params.value);

                }
                return "OK";
            }
            throw new Error("Variable not found");

        }
        throw new Error("Incorect call");
    },
    async getDownloadUrl({ homey, body }) {
        return await homey.app.getDownloadUrl(body);
    }
};


function isNumber(obj) { return !isNaN(parseFloat(obj)); }
