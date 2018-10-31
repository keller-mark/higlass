/* eslint-env node, mocha */
import {
  configure,
  // render,
} from 'enzyme';

import Adapter from 'enzyme-adapter-react-16';

import { expect } from 'chai';

// Utils
import {
  waitForTransitionsFinished,
  waitForTilesLoaded,
  removeHGComponent,
} from '../app/scripts/utils';


import {
  simpleCenterViewConfig,
} from './view-configs';

import {
  viewer
} from '../app/scripts/hglib';

configure({ adapter: new Adapter() });

function createElementAndAPI(viewConfig, options) {
  const div = global.document.createElement('div');
  global.document.body.appendChild(div);

  div.setAttribute('style', 'width:600px; height: 400px; background-color: lightgreen');

  const api = viewer(div, viewConfig, options);
 
  return [div, api];
}

describe('Simple HiGlassComponent', () => {
  describe('Options tests', () => {
    it('creates an editable component', () => {
      const [div, api] = createElementAndAPI(simpleCenterViewConfig);

      const component = api.getComponent();

      // console.log('viewHeaders:', component.viewHeaders);
      expect(Object.keys(component.viewHeaders).length).to.be.above(0);


      removeHGComponent(div);
    });

    it('zooms to negative domain', (done) => {
      const [div, api] = createElementAndAPI(simpleCenterViewConfig,
        { editable: false });

      api.zoomTo('a', 6.069441699652629, 6.082905691828387,
        -23.27906532393644, -23.274695776773807, 100);

      waitForTransitionsFinished(api.getComponent(), () => {
        expect(api.getComponent().yScales.a.domain()[0]).to.be.below(0);

        removeHGComponent(div);
        done();
      });
    });

    it('zooms to just x and y', (done) => {
      const [div, api] = createElementAndAPI(simpleCenterViewConfig,
        { editable: false });

      api.zoomTo('a', 6.069441699652629, 6.082905691828387, null, null, 100);

      waitForTransitionsFinished(api.getComponent(), () => {
        waitForTilesLoaded(api.getComponent(), () => {
          // console.log(api.getComponent().yScales.a.domain());

          expect(api.getComponent().yScales.a.domain()[0]).to.be.above(2);

          const trackObj = api.getTrackObject('a', 'heatmap1');
          // console.log('trackObj', trackObj);
          // trackObj.getMouseOverHtml(50,50);

          const rd = trackObj.getVisibleRectangleData(285, 156, 11, 11);
          expect(rd.data.length).to.eql(1);
          // trackObj.getVisibleRectangleData(24,8,11,11);

          // console.log('visi', trackObj.visibleAndFetchedTiles());
          removeHGComponent(div);
          done();
        });
      });
    });

    it ('zoom to a nonexistent view', () => {
      // complete me, should throw an error rather than complaining
      // "Cannot read property 'copy' of undefined thrown"
      const [div, api] = createElementAndAPI(simpleCenterViewConfig,
        { editable: false });

      expect(() => api.zoomTo('nonexistent', 6.069441699652629, 6.082905691828387,
        -23.274695776773807, -23.27906532393644))
        .to.throw('Invalid viewUid. Current present uuids: a');
      
      removeHGComponent(div);
    });

    it('creates a non editable component', () => {
      const [div, api] = createElementAndAPI(simpleCenterViewConfig,
        { editable: false });

      const component = api.getComponent();

      // console.log('viewHeaders:', component.viewHeaders);
      expect(Object.keys(component.viewHeaders).length).to.eql(0);

      removeHGComponent(div);
    });

    it('retrieves a track', () => {
      const [div, api] = createElementAndAPI(simpleCenterViewConfig,
        { editable: false });

      // const component = api.getComponent();
      const viewconf = api.getViewConfig();
      const trackObj = api.getTrackObject(viewconf.views[0].tracks.center[0].uid);

      expect(trackObj).to.exist;

      // console.log('viewHeaders:', component.viewHeaders);
      // expect(Object.keys(component.viewHeaders).length).to.eql(0);
      removeHGComponent(div);
    });
    
    it('zooms to a negative location', (done) => {
      const [div, api] = createElementAndAPI(simpleCenterViewConfig,
        { editable: false, bounded: true });

      // const component = api.getComponent();
      const viewconf = api.getViewConfig();

      // console.log('viewconf.initialXDomain', api.getComponent().xScales.a.domain());
      api.zoomTo('a', -10000000, 10000000);

      waitForTransitionsFinished(api.getComponent(), () => {
        waitForTilesLoaded(api.getComponent() , () => {
          // console.log('viewconf.initialXDomain', api.getViewConfig());    

          removeHGComponent(div);
          done();      
        })
      });

      // console.log('viewHeaders:', component.viewHeaders);
      // expect(Object.keys(component.viewHeaders).length).to.eql(0);
      
    });
    // it('creates a new component with different options and checks'
    //   + 'whether the global options object of the first object has changed', () => {
    //   // create one div and set an auth header
    //   const div = global.document.createElement('div');
    //   global.document.body.appendChild(div);

    //   const api = viewer(div, simpleCenterViewConfig, { a: 'x' });

    //   api.setViewConfig(simpleCenterViewConfig);
    //   api.setAuthHeader('blah');

    //   // create a second component and set a different auth header
    //   const div1 = global.document.createElement('div');
    //   global.document.body.appendChild(div1);

    //   const api1 = viewer(div1, simpleCenterViewConfig, { a: 'y' });
    //   api1.setAuthHeader('wha');

    //   // check to make sure that the two components have different
    //   // auth headers

    //   document.body.removeChild(div);
    //   document.body.removeChild(div1);
    // });
  });
});