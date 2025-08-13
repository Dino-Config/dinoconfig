import { Component, CUSTOM_ELEMENTS_SCHEMA, ViewEncapsulation } from '@angular/core';
import { createInstance } from '@module-federation/enhanced/runtime';

@Component({
  selector: 'app-react-wrapper',
  template: `<dinoconfig-builder></dinoconfig-builder>`,
  encapsulation: ViewEncapsulation.None,
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ConfigBuilderComponent {
    constructor() {
        const mf = createInstance({
            name: '@dinoconfig/dinoconfig-host-fe',
            remotes: [
                {
                    name: 'dinoconfig_builder',
                    entry: 'http://localhost:4201/remoteEntry.js',
                },
            ],
        });
        mf.loadRemote('dinoconfig_builder/Module');
    }
}
