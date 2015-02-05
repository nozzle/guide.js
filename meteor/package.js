// package metadata file for Meteor.js
'use strict';

var packageName = '416serg:onboardjs';  // https://atmospherejs.com/416serg/onboardjs
var where = 'client';  // where to install: 'client' or 'server'. For both, pass nothing.

Package.describe({
  name: packageName,
  summary: 'onboard.js, a jQuery plugin that creates an elegant overlay for onboarding and product tours.',
  version: '0.0.1',
  git: 'https://github.com/416serg/onboard.js'
});

Package.onUse(function (api) {
  api.versionsFrom(['METEOR@0.9.0', 'METEOR@1.0']);
  api.export('Onboard');
  api.addFiles([
    'onboard.js',
    'onboard.css'
  ], where
  );
});

// Package.onTest(function (api) {
//   api.use(packageName, where);
//   api.use('tinytest', where);
//
//   api.addFiles('meteor/test.js', where);
// });
