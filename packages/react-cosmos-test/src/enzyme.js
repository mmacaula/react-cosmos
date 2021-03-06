// @flow

import { mount as mountEnzyme } from 'enzyme';
import { createContext as createGenericContext } from './generic';

import type { ComponentType } from 'react';
import type {
  Wrapper,
  Renderer,
  ContextFunctions
} from 'react-cosmos-loader/src/types';
import type { TestContextArgs } from './generic';

type Selector = string | ComponentType<*>;

// eslint-disable-next-line no-undef
export type EnzymeContextArgs = $Diff<TestContextArgs, { renderer: Renderer }>;

type EnzymeWrapper = Wrapper & {
  update: () => any,
  find: (selector: ?Selector) => EnzymeWrapper
};

type EnzymeContextFunctions = ContextFunctions & {
  getRootWrapper: () => EnzymeWrapper,
  getWrapper: (selector: ?Selector) => EnzymeWrapper
};

export function createContext(args: EnzymeContextArgs): EnzymeContextFunctions {
  const context = createGenericContext({
    ...args,
    renderer: mountEnzyme
  });
  const { mount, unmount, getRef, get, getField } = context;

  function getRootWrapper(): EnzymeWrapper {
    const wrapper = wrapWrapper(context.getWrapper());

    // Ensure the returned wrapper is always up to date
    wrapper.update();

    return wrapper;
  }

  function getWrapper(selector: ?Selector): EnzymeWrapper {
    const { fixture } = args;
    const innerWrapper = getRootWrapper().find(fixture.component);

    return selector ? innerWrapper.find(selector) : innerWrapper;
  }

  function setProps(props: any) {
    const { fixture } = args;
    const updatedFixture = {
      ...fixture,
      props: {
        ...fixture.props,
        ...props
      }
    };
    getRootWrapper().setProps({ fixture: updatedFixture });
  }

  function set(key: string, valueToReplace: any) {
    const { fixture } = args;
    const updatedFixture = {
      ...fixture,
      [key]: valueToReplace
    };
    getRootWrapper().setProps({ fixture: updatedFixture });
  }

  return {
    mount,
    unmount,
    getRef,
    get,
    getField,
    getRootWrapper,
    getWrapper,
    set,
    setProps
  };
}

// Sorry Flow: I don't know how to show you that the wrapper is already an
// EnzymeWrapper
function wrapWrapper(wrapper: any): EnzymeWrapper {
  if (typeof wrapper.update !== 'function') {
    throw new TypeError('update method missing on Enzyme wrapper');
  }
  if (typeof wrapper.find !== 'function') {
    throw new TypeError('find method missing on Enzyme wrapper');
  }

  return wrapper;
}
