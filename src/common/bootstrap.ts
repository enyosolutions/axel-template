import express, { Application } from 'express';
import { ServerInitFunction } from '../axel';
import SchemaValidator from '../axel/services/SchemaValidator';
import AxelAdmin from '../axel/services/AxelAdmin';
import AxelManager from '../axel/services/AxelManager';

export const beforeFn: ServerInitFunction = (app: Application) => {
  console.log('before');
  return new Promise((resolve, reject) => {
    console.log('before fn');
    // add the functions that you'd like to run before the app has started
    // Example the db connection if it's crucial to some startup operation

    resolve();
  });
};

export const afterFn: ServerInitFunction = (app: Application) =>
  new Promise((resolve, reject) => {
    // add the function that you'd like to run after the app has started
    // Example the cron services.
    SchemaValidator.init();
    AxelAdmin.init(app);
    AxelManager.init(app);
    resolve();
  });
