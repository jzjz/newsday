(function($) {

	"use strict";

	function Trivia(element, data, options) {
		this.options = $.extend({}, $.fn.trivia.defaults, options);
		var $element = $(element);

		this.$alert = $element.find(this.options.selectors.alert);

		if(data.questions.length) {
			this.data = data.questions;
			this.current_index = -1;
			this.correct_count = 0;

			this.$choices = $element.find(this.options.selectors.choices);
			this.$form = $element.find(this.options.selectors.form);
			this.$next = $element.find(this.options.selectors.next);
			this.$question = $element.find(this.options.selectors.question);
			this.$submit = $element.find(this.options.selectors.submit);

			$element.on('submit', $.proxy(function(e) {
				e.preventDefault();
				this.answer_submit();
			}, this));

			$element.on('click', this.options.selectors.next, $.proxy(function(e) {
				e.preventDefault();
				this.form_enable();
				this.question_next();
			}, this));
			this.question_next();

		} else {
			this._alert('Something went wrong. Please refresh.', 'alert-error');
		}
	}

	Trivia.prototype = {

		_alert: function(msg, classes) {
			this.$alert.html(msg).attr('class', '').addClass('alert' + (typeof(classes) === 'string' ? ' ' + classes : ''));
		},

		form_enable: function() {
			this.$next.addClass('hide');
			this.$submit.prop('disabled', false);
		},

		form_disable: function() {
			this.$form.find('input').prop('disabled', true);
			this.$submit.prop('disabled', true);
			this.$next.removeClass('hide');
		},

		answer_submit: function() {
			var $selected = this.$form.find('input:checked');
			if($selected.length) {
				this.form_disable();

				var $parent = $selected.parents('li'),
					correct = $selected.val() == this.current.correct,
					type = correct ? 'success' : 'error',
					msg = correct ? 'Correct' : 'Incorrect';

				if(correct) {
					this.correct_count++;
				} else {
					this.$form.find('input[value=' + this.current.correct + ']').parents('li').addClass('success');
				}

	 			var score = Math.round(this.correct_count / (this.current_index + 1) * 100);

				this._alert('<strong>' + msg + '!</strong> You have answered ' + this.correct_count + ' of ' + (this.current_index + 1) + ' correctly for a score of ' + score + '%. Among all readers, ' + this.current.otherReaders + '% answered this question correctly.', 'alert-' + type);
				$parent.addClass(type);
			} else {
				this._alert('Please select an answer.');
			}
		},

		question_next: function(index) {
			this.current_index = typeof(index) === 'number' ? index : this.current_index + 1;

			if(this.current_index >= this.data.length) {
				this.$form.html('<strong>You have reached the end. Refresh this page to start over.</strong>');
			} else if(typeof(this.data[this.current_index]) === 'object') {
				this.current = this.data[this.current_index];

				this.$question.html(this.current['question' + (this.current_index + 1)]);

				this.$choices.empty();
				var choices = [];
				$.each(this.current.choices, function(i, choice) {
					var li = $('<li>');
					var input = $('<input>').attr({ 'type': 'radio', 'name': 'choice', 'value': choice.id });
					var label = $('<label>').addClass('radio');
					label.html(' ' + choice.text).prepend(input);
					li.prepend(label);
					choices[i] = li;
				});
				if(choices.length) {
					this.$choices.append(choices);
				}
			} else {
				this._alert('Could not find the question. Please refresh.', 'alert-error');
			}
		}

	};

	$.fn.trivia = function(questions, options){
		return this.each(function() {
			var $this = $(this);
			if(!$this.data('trivia')) {
				$this.data('trivia', new Trivia(this, questions, options));
			}
		});
	};

	$.fn.trivia.defaults = {
		selectors: {
			alert: '#alert',
			choices: '#choices',
			form: 'form',
			next: '#next',
			question: '#question',
			submit: '#submit'
		}
	};

})(jQuery);

function init_trivia(questions) {
	$('#trivia').trivia(questions);
}