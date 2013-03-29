/**
 * @file Contains the jQuery "webks Responsive Table" Plugin.
 * 
 * @version 1.0.0
 * @since 2012-08-20
 * @see Project home:
 * @category responsive webdesign, jquery
 * @author webks:websolutions kept simple - Julian Pustkuchen & Thomas Frobieter
 *         GbR | http://www.webks.de
 * @copyright webks:websolutions kept simple - Julian Pustkuchen & Thomas
 *            Frobieter GbR | http://www.webks.de
 */
(function($) {
  /*
   * Usage Examples:
   *  -- Simple: -- Make all tables responsible using the default settings.
   * $('table').responsiveTable();
   *  -- Custom configuration example 1 (Disable manual switch): --
   * $('table').responsiveTable({ showSwitch: false });
   *  -- Custom configuration example 2 (Use different selectors): --
   * $('table').responsiveTable({ headerSelector: 'tr th', bodyRowSelector:
   * 'tr', });
   *  -- Custom configuration example 3 (Use different screensize in dynamic
   * mode): -- $('table').responsiveTable({ displayResponsiveCallback:
   * function() { return $(document).width() < 500; // Show responsive if screen
   * width < 500px }, });
   *  -- Custom configuration example 4 (Make ALL tables responsive - regardless
   * of screensize): -- $('table').responsiveTable({ dynamic: false });
   */

  /**
   * jQuery "webks Responsive Table" plugin transforms less mobile compliant
   * default HTML Tables into a flexible responsive format. Furthermore it
   * provides some nice configuration options to optimize it for your special
   * needs.
   * 
   * Technically the selected tables are being transformed into a list of
   * (definition) lists. The table header columns are used as title for each
   * value.
   * 
   * Functionality: - Select tables easily by jQuery selector. - Provide custom
   * rules (by callback function) for transformation into tables mobile version. -
   * Hard or dynamic switching for selected tables. - Use custom header and
   * content rows selectors. - Provides an optional, customizable link to
   * default table layout. - (Optionally) preserves most of the table elements
   * class attributes. - Decide if the original table is kept in DOM and set
   * invisible or completely removed. - Update display type (Table / Responsive &
   * re-calculate dynamic switch) by easily calling
   * .responsiveTableUpdate()-function.
   * 
   * Functionality may be applied to all DOM table elements. See examples above.
   * Please ensure that the settings match your requirements and your table
   * structure is compliant.
   */
  $.fn.responsiveTable = function(options) {
    return $(this).each(function(){
      $(this).responsiveTableInit(options);
    });
  };

  /**
   * Initializes the responsive tables. Expects to be executed on DOM table
   * elements only. These are being transformed into responsive tables like
   * configured.
   * 
   * @param options
   *            Optional JSON list of settings.
   */
  $.fn.responsiveTableInit = function(options) {
    var settings = $.extend({
      /**
       * Keep table components classes as far as possible for the responsive
       * output.
       */
      preserveClasses : true,
      /**
       * true: Toggle table style if settings.dynamicSwitch() returns true.
       * false: Only convert to mobile (one way)
       */
      dynamic : true,
      /**
       * (Only used if dynamic!) If this function returns true, the responsive
       * version is shown, else displays the default table. Might be used to set
       * a switch based on orientation, screen size, ... for dynamic switching!
       * 
       * @return boolean
       */
      displayResponsiveCallback : function() {
        return $(document).width() < 960;
      },
      /**
       * (Only used if dynamic!) Display a link to switch back from responsive
       * version to original table version.
       */
      showSwitch : true,
      /**
       * (Only used if showSwitch: true!) The title of the switch link.
       */
      switchTitle : 'Switch to default table view.',
      
      // Selectors
      /**
       * The header columns selector.
       * Default: 'thead td, thead th';
       * other examples: 'tr th', ...
       */
      headerSelector : 'thead td, thead th',
      /**
       * The body rows selector.
       * Default: 'tbody tr';
       * Other examples: 'tr', ...
       */
      bodyRowSelector : 'tbody tr',
      
      // Elements
      /**
       * The responsive rows container
       * element. 
       * Default: '<dl></dl>';
       * Other examples: '<ul></ul>'.
       */
      responsiveRowElement : '<dl></dl>',
      /**
       * The responsive column title
       * container element.
       * Default: '<dt></dt>'; 
       * Other examples: '<li></li>'.
       */
      responsiveColumnTitleElement : '<dt></dt>',
      /**
       * The responsive column value container element. 
       * Default: '<dd></dd>'; 
       * Other examples: '<li></li>'.
       */
      responsiveColumnValueElement : '<dd></dd>'
    }, options);

    return this.each(function() {
      // $this = The table (each).
      var $this = $(this);

      // Ensure that the element this is being executed on a table!
      $this._responsiveTableCheckElement(false);

      if ($this.data('webks-responsive-table-processed')) {
        // Only update if already processed.
        $this.responsiveTableUpdate();
        return true;
      }

      // General
      var result = $('<div></div>');
      result.addClass('webks-responsive-table');
      if (settings.preserveClasses) {
        result.addClass($this.attr('class'));
      }

      // Head
      // Iterate head - extract titles
      var titles = new Array();
      $this.find(settings.headerSelector).each(function(i, e) {
        var title = $(this).html();
        titles[i] = title;
      });

      // Body
      // Iterate body
      $this.find(settings.bodyRowSelector).each(function(i, e) {
        // Row
        var row = $(settings.responsiveRowElement);
        row.addClass('row row-' + i);
        if (settings.preserveClasses) {
          row.addClass($(this).attr('class'));
        }
        // Column
        $(this).children('td').each(function(ii, ee) {
          var dt = $(settings.responsiveColumnTitleElement);
          if (settings.preserveClasses) {
            dt.addClass($(this).attr('class'));
          }
          dt.addClass('title col-' + ii);
          dt.html(titles[ii]);
          var dd = $(settings.responsiveColumnValueElement);
          if (settings.preserveClasses) {
            dd.addClass($(this).attr('class'));
          }
          dd.addClass('value col-' + ii);
          dd.html($(this).html());
          // Set empty class if value is empty.
          if ($.trim($(this).html()) == '') {
            dd.addClass('empty');
            dt.addClass('empty');
          }
          row.append(dt).append(dd);
        });
        result.append(row);
      });

      // Display responsive version after table.
      $this.after(result);

      // Further + what shell we do with the processed table now?
      if (settings.dynamic) {
        if (settings.showSwitch) {
          var switchBtn = $('<a>');
          switchBtn.html(settings.switchTitle);
          switchBtn.addClass('switchBtn btn');
          switchBtn.attr('href', '#');

          $('div.webks-responsive-table a.switchBtn').live('click',
              function(e) {
                $this.responsiveTableShowTable();
                e.preventDefault();
                return false;
              });
          result.prepend(switchBtn);
        }

        // Connect result to table
        $this.data('webks-responsive-table', result);
        $this.data('webks-responsive-table-processed', true);

        // Connect table to result.
        result.data('table', $this);
        result.data('settings', settings);
        $this.data('webks-responsive-table-processed', true);

        // Hide table. We might need it again!
        $this.hide();

        // Run check to display right display version (table or responsive)
        $this.responsiveTableUpdate();
      } else {
        // Remove table entirely.
        $this.remove();
      }
    });
  };
  /**
   * Re-Check the .displayResponsiveCallback() and display table according to
   * its result. Only available if settings.dynamic is true.
   * 
   * May be called on Window resize, Orientation Change, ... Must be executed on
   * already processed DOM table elements.
   */
  $.fn.responsiveTableUpdate = function() {
    return this.each(function() {
      // $this = The table (each).
      var $this = $(this);

      // Ensure that the element this is being executed on must be a table!
      $this._responsiveTableCheckElement(true);

      var responsiveTable = $this.data('webks-responsive-table');
      if (responsiveTable != undefined) {
        var settings = responsiveTable.data('settings');
        if (settings != undefined) {
          // Check preconditions!
          if (settings.dynamic) {
            // Is dynamic!
            if (!settings.displayResponsiveCallback()) {
              // NOT matching defined responsive conditions!
              // Show original table and skip!
              $this.responsiveTableShowTable();
            } else {
              $this.responsiveTableShowResponsive();
            }
          }
        }
      }
    });
  };
  /**
   * Displays the default table style and hides the responsive layout.
   * 
   * Only available if settings.dynamic is true. Does nothing if the current
   * display is already as wished.
   */
  $.fn.responsiveTableShowTable = function() {
    return this.each(function() {
      // $this = The table (each).
      var $this = $(this);
      // Ensure that the element this is being executed on must be a table!
      $this._responsiveTableCheckElement(true);

      var responsiveTable = $this.data('webks-responsive-table');
      if (responsiveTable.length > 0) {
        $this.show();
        responsiveTable.hide();
      }
    });
  };

  /**
   * Displays the responsive style and hides the default table layout.
   * 
   * Only available if settings.dynamic is true. Does nothing if the current
   * display is already as wished.
   */
  $.fn.responsiveTableShowResponsive = function() {
    return this.each(function() {
      // $this = The table (each).
      var $this = $(this);
      // Ensure that the element this is being executed on must be a table!
      $this._responsiveTableCheckElement();

      var responsiveTable = $this.data('webks-responsive-table');
      if (responsiveTable.length > 0) {
        $this.hide();
        responsiveTable.show();
      }
    });
  };

  /**
   * Checks the general preconditions for elements that this Plugin is being
   * executed on.
   * 
   * @throws Exception
   *             if the given DOM element is not a table.
   * @throws Exception
   *             if a helper method is directly called on a not yet initialized
   *             table.
   */
  $.fn._responsiveTableCheckElement = function(checkProcessed) {
    if (checkProcessed === undefined) {
      checkProcessed = true;
    }
    var $this = $(this);
    if (!$this.is('table')) {
      throw 'The selected DOM element may only be a table!';
    }    
    if (checkProcessed
        && ($this.data('webks-responsive-table-processed') === undefined || !$this
            .data('webks-responsive-table-processed'))) {
      throw 'The selected DOM element has to be initialized by webks-responsive-table first.';
    }
    return $this;
  };
})(jQuery);
