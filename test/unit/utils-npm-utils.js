'use strict';

const expect = require('chai').expect;
const injectr = require('injectr');
const sinon = require('sinon');

describe('utils : npm-utils', () => {
  const crossSpawnStub = sinon.stub();

  const npmUtils = injectr('../../src/utils/npm-utils.js', {
    'cross-spawn': crossSpawnStub,
    path: { join: (...items) => items.join('/') }
  });

  const installPath = 'path/to/component';
  const initPath = installPath;

  describe('init()', () => {
    const scenarios = [
      {
        input: { initPath },
        output: ['init', '--yes', '--no-package-lock'],
        cmdCall: { cwd: initPath, stdio: 'inherit' }
      },
      {
        input: { initPath, silent: true },
        output: ['init', '--yes', '--no-package-lock'],
        cmdCall: { cwd: initPath, stdio: 'ignore' }
      }
    ];

    scenarios.forEach(scenario => {
      const { initPath, silent } = scenario.input;
      describe(`when invoked for ${initPath} with silent=${silent}`, () => {
        let error, onStub;
        beforeEach(done => {
          onStub = sinon.stub();
          crossSpawnStub.reset();
          crossSpawnStub.returns({ on: onStub });
          npmUtils.init(scenario.input, (err, res) => {
            error = err;
            done();
          });
          onStub.args[1][1](0);
        });

        it('should spawn the process with correct parameters', () => {
          expect(crossSpawnStub.args[0][0]).to.equal('npm');
          expect(crossSpawnStub.args[0][1]).to.deep.equal(scenario.output);
          expect(crossSpawnStub.args[0][2]).to.deep.equal(scenario.cmdCall);
        });

        it('should return no error', () => {
          expect(error).to.be.null;
        });

        it('should correctly setup on error and on close listeners', () => {
          expect(onStub.args[0][0]).to.equal('error');
          expect(onStub.args[1][0]).to.equal('close');
        });
      });
    });
  });

  describe('installDependency()', () => {
    const scenarios = [
      {
        input: {
          dependency: 'oc-template-jade-compiler',
          installPath,
          isDev: true,
          save: true
        },
        output: [
          'install',
          '--prefix',
          'path/to/component',
          '--save-exact',
          '--save-dev',
          'oc-template-jade-compiler',
          '--no-package-lock'
        ]
      },
      {
        input: {
          dependency: 'lodash',
          installPath,
          isDev: true,
          save: false
        },
        output: [
          'install',
          '--prefix',
          'path/to/component',
          'lodash',
          '--no-package-lock'
        ]
      },
      {
        input: {
          dependency: 'underscore',
          installPath,
          isDev: false,
          save: true
        },
        output: [
          'install',
          '--prefix',
          'path/to/component',
          '--save-exact',
          '--save',
          'underscore',
          '--no-package-lock'
        ]
      },
      {
        input: { dependency: 'oc-client@~1.2.3', installPath, save: false },
        output: [
          'install',
          '--prefix',
          'path/to/component',
          'oc-client@~1.2.3',
          '--no-package-lock'
        ]
      }
    ];

    scenarios.forEach(scenario => {
      const dependency = scenario.input.dependency;
      describe(`when invoked for installing ${dependency}`, () => {
        let error, result, onStub;
        beforeEach(done => {
          onStub = sinon.stub();
          crossSpawnStub.reset();
          crossSpawnStub.returns({ on: onStub });
          npmUtils.installDependency(scenario.input, (err, res) => {
            error = err;
            result = res;
            done();
          });
          onStub.args[1][1](0);
        });

        it('should spawn the process with correct parameters', () => {
          expect(crossSpawnStub.args[0][0]).to.equal('npm');
          expect(crossSpawnStub.args[0][1]).to.deep.equal(scenario.output);
          expect(crossSpawnStub.args[0][2]).to.deep.equal({
            cwd: installPath,
            stdio: 'inherit'
          });
        });

        it('should return no error', () => {
          expect(error).to.be.null;
        });

        it('should return the installation path', () => {
          expect(result).to.deep.equal({
            dest: `path/to/component/node_modules/${dependency.split('@')[0]}`
          });
        });

        it('should correctly setup on error and on close listeners', () => {
          expect(onStub.args[0][0]).to.equal('error');
          expect(onStub.args[1][0]).to.equal('close');
        });
      });
    });
  });

  describe('installDependencies()', () => {
    const scenarios = [
      {
        input: {
          dependencies: ['oc-template-jade-compiler', 'lodash'],
          installPath,
          isDev: true,
          save: true
        },
        output: [
          'install',
          '--prefix',
          'path/to/component',
          '--save-exact',
          '--save-dev',
          'oc-template-jade-compiler',
          'lodash',
          '--no-package-lock'
        ]
      },
      {
        input: {
          dependencies: ['moment', 'lodash'],
          installPath,
          isDev: true,
          save: false
        },
        output: [
          'install',
          '--prefix',
          'path/to/component',
          'moment',
          'lodash',
          '--no-package-lock'
        ]
      },
      {
        input: {
          dependencies: ['underscore', 'oc-client'],
          installPath,
          isDev: false,
          save: true
        },
        output: [
          'install',
          '--prefix',
          'path/to/component',
          '--save-exact',
          '--save',
          'underscore',
          'oc-client',
          '--no-package-lock'
        ]
      },
      {
        input: {
          dependencies: ['oc-client@~1.2.3', 'oc-template-react-compiler'],
          installPath,
          save: false
        },
        output: [
          'install',
          '--prefix',
          'path/to/component',
          'oc-client@~1.2.3',
          'oc-template-react-compiler',
          '--no-package-lock'
        ]
      }
    ];

    scenarios.forEach(scenario => {
      const dependencies = scenario.input.dependencies;
      describe(`when invoked for installing [${dependencies.join(
        ', '
      )}]`, () => {
        let error, result, onStub;
        beforeEach(done => {
          onStub = sinon.stub();
          crossSpawnStub.reset();
          crossSpawnStub.returns({ on: onStub });
          npmUtils.installDependencies(scenario.input, (err, res) => {
            error = err;
            result = res;
            done();
          });
          onStub.args[1][1](0);
        });

        it('should spawn the process with correct parameters', () => {
          expect(crossSpawnStub.args[0][0]).to.equal('npm');
          expect(crossSpawnStub.args[0][1]).to.deep.equal(scenario.output);
          expect(crossSpawnStub.args[0][2]).to.deep.equal({
            cwd: installPath,
            stdio: 'inherit'
          });
        });

        it('should return no error', () => {
          expect(error).to.be.null;
        });

        it('should return the installation path', () => {
          expect(result).to.deep.equal({
            dest: dependencies.map(
              dependency =>
                `path/to/component/node_modules/${dependency.split('@')[0]}`
            )
          });
        });

        it('should correctly setup on error and on close listeners', () => {
          expect(onStub.args[0][0]).to.equal('error');
          expect(onStub.args[1][0]).to.equal('close');
        });
      });
    });
  });
});
