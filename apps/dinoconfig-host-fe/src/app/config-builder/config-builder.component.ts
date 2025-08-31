import { Component, CUSTOM_ELEMENTS_SCHEMA, ViewEncapsulation } from '@angular/core';
import { createInstance } from '@module-federation/enhanced/runtime';

@Component({
  selector: 'app-dinoconfig-builder-wrapper',
  template: `<dinoconfig-builder></dinoconfig-builder>`,
  encapsulation: ViewEncapsulation.None,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styleUrls: ['./config-builder.component.scss']
})
export class DinoconfigBuilderWrapperComponent {
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
