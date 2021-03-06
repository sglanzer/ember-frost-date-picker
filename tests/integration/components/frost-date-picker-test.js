import {expect} from 'chai'
import Ember from 'ember'
const {$, run} = Ember
import {$hook, initialize as initializeHook} from 'ember-hook'
import {describeComponent} from 'ember-mocha'
import wait from 'ember-test-helpers/wait'
import hbs from 'htmlbars-inline-precompile'
import {afterEach, beforeEach, describe, it} from 'mocha'
import moment from 'moment'
import sinon from 'sinon'

import {openDatepicker} from 'dummy/tests/ember-frost-date-picker'

/**
 * Click outside the date picker to close it
 * @param {Object} context - the test context
 */
function closePikaday (context) {
  context.$().click()
}

describeComponent(
  'frost-date-picker',
  'Integration: EmberFrostDatePickerComponent',
  {
    integration: true
  },
  function () {
    let sandbox
    beforeEach(function () {
      sandbox = sinon.sandbox.create()
      initializeHook()
    })

    afterEach(function () {
      sandbox.restore()
    })

    describe.skip('behaviour', function () {
      it('opens on click', function (done) {
        this.render(hbs`
        {{frost-date-picker
          hook='my-picker'
        }}`)
        run.later(() => {
          $hook('my-picker-input').click()
          expect($('.pika-single.is-hidden'), 'Is visible').to.have.length(0)
          done()
        })
      })
      it('sends actions on open', function (done) {
        let onDrawCalled = sinon.spy()
        let onOpenCalled = sinon.spy()
        this.set('onDraw', onDrawCalled)
        this.set('onOpen', onOpenCalled)
        this.render(hbs`
        {{frost-date-picker
          hook='my-picker'
          onDraw=onDraw
          onOpen=onOpen
        }}`)
        run.later(() => {
          $hook('my-picker-input').click()
          run.later(() => {
            expect(onDrawCalled.callCount, 'onDraw called').to.equal(1)
            expect(onOpenCalled.callCount, 'onOpen called').to.equal(1)
            done()
          })
        })
      })

      it('sets the date when the value is set', function (done) {
        const mValue = '2010-10-10'
        this.set('mValue', mValue)
        this.render(hbs`
          {{frost-date-picker
            hook='my-picker'
            currentValue=mValue
          }}`)
        run.later(() => {
          const value = $hook('my-picker-input').val()
          expect(value, 'currentValue').to.equal(mValue)
          done()
        })
      })

      it('applies provided format', function (done) {
        const fmt = 'YYYY-MM-DD-[test]'
        this.set('fmt', fmt)
        this.set('mValue', '2017-01-24')
        this.render(hbs`
          {{frost-date-picker
            hook='my-picker'
            currentValue=mValue
            format=fmt
          }}`)
        run.later(() => {
          const mValue = this.get('mValue')
          expect(mValue, 'currentValue').to.equal(moment('2017-01-24').format(fmt))
          done()
        })
      })
      it('closes on outside click', function (done) {
        let onCloseCalled = sinon.spy()
        this.set('onClose', onCloseCalled)
        this.render(hbs`
        {{frost-date-picker
          hook='my-picker'
          onClose=onClose
        }}`)
        run.later(() => {
          $hook('my-picker-input').click()
          run.later(() => {
            this.$().click()
            expect(onCloseCalled.callCount, 'onClose called').to.equal(1)
            expect($('.pika-single.is-hidden'), 'Is hidden').to.have.length(1)
            done()
          })
        })
      })
    })
    describe.skip('after render', function () {
      beforeEach(function () {
        this.setProperties({
          myHook: 'myThing'
        })

        this.render(hbs`
          {{frost-date-picker
            hook=myHook
          }}
        `)

        return wait()
      })
      it('should have an element', function () {
        expect(this.$()).to.have.length(1)
      })

      it('should be accessible via the hook', function () {
        expect($hook('myThing')).to.have.length(1)
      })
    })

    describe.skip('when passed undefined currentValue', function () {
      let selectStub
      beforeEach(function () {
        selectStub = sandbox.stub()
        this.setProperties({
          myCurrentValue: undefined,
          myHook: 'hook',
          selectStub: selectStub
        })

        this.render(hbs`
          {{frost-date-picker
            currentValue=myCurrentValue
            hook=myHook
            onSelect=selectStub
          }}
        `)

        return wait()
      })

      it('should have null input value', function () {
        expect($hook('hook-input')).to.have.value('')
      })

      // This does not work
      describe.skip('when value is set programmatically', function () {
        beforeEach(function () {
          this.set('myCurrentValue', '1999-12-31')
        })

        it('should update the input value', function () {
          expect($hook('hook-input')).to.have.value('1999-12-31')
        })
      })

      describe('when value is set by user', function () {
        beforeEach(function () {
          const interactor = openDatepicker('hook')
          interactor.selectDate(new Date(2017, 0, 24))
          closePikaday(this)
        })

        it('should call onSelect with the updated value', function () {
          expect(selectStub).to.have.been.calledWith('2017-01-24')
        })

        it('should display the updated value', function () {
          expect($hook('hook-input')).to.have.value('2017-01-24')
        })
      })
    })
  }
)
