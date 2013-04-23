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
  $.fn.responsiveTable = function(method) {

    var methods = {
      init: function(options) {
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
          var $this = $(this);
          var data = $this.data("responsiveTable");
          
          _checkElement.call(this, false);
          
          // General
          var result = $('<div></div>').addClass('webks-responsive-table').hide();
          if (settings.preserveClasses) result.addClass($this.attr('class'));
          
          _buildResponsiveTable.call(this, settings, result)
          
          // Display responsive version after table.
          $this.after(result);

          // Further + what shell we do with the processed table now?
          if (settings.dynamic) {
            if (settings.showSwitch) {
              var switchBtn = $('<a>');
              switchBtn.html(settings.switchTitle);
              switchBtn.addClass('switchBtn');
              switchBtn.attr('href', '#');

              switchBtn.click(
                  function(e) {
                    methods.showTable.call($([$this]));
                    e.preventDefault();
                    return false;
                  });
              result.prepend(switchBtn);
            }

            // Connect result to table
            var data = { responsive: result, settings: settings }
            $this.data('responsiveTable', data);

            // Hide table. We might need it again!
            $this.hide();

            // Run check to display right display version (table or responsive)
            methods.update.call($([this]));
            
          } else {
            // Remove table entirely.
            $this.remove();
          }
        })
      },
      
      /**
       * Refresh the responsive table the data from the table.
       * Useful if the table changes after it was initialized
       */
      refresh: function() {
        return this.each(function() {
          _checkElement.call(this, true);
          
          var $this = $(this);
          var data = $this.data('responsiveTable');

          data.responsive.empty();
          _buildResponsiveTable.call($this, data.settings, data.responsive);
        });
      },
      
      /**
       * Re-Check the .displayResponsiveCallback() and display table according to
       * its result. Only available if settings.dynamic is true.
       * 
       * May be called on Window resize, Orientation Change, ... Must be executed on
       * already processed DOM table elements.
       */
      update: function() {
        return this.each(function() {
          var $this = $(this);

          // Ensure that the element this is being executed on must be a table!
          _checkElement.call(this, true);
          var data = $this.data('responsiveTable');
          
          // Original code did nothing if dynamic == false. But it should be impossible.          
          if(data.settings.dynamic == false) throw "How could you could update in a not dynamic table. Impossible"
          
          if (!data.settings.displayResponsiveCallback()) {
            methods.showTable.call($([this]))
          }
          else {
            methods.showResponsive.call($([this]))
          }
        });
      },
          
      /**
       * Displays the default table style and hides the responsive layout.
       * 
       * Only available if settings.dynamic is true. Does nothing if the current
       * display is already as wished.
       */
      showTable: function() {
        return this.each(function() {
          var $this = $(this);
          
          // Ensure that the element this is being executed on must be a table!
          _checkElement.call(this, true);
          var data = $this.data('responsiveTable');

          $this.show();
          data.responsive.hide();
        });
      },
      
      /**
       * Displays the responsive style and hides the default table layout.
       * 
       * Only available if settings.dynamic is true. Does nothing if the current
       * display is already as wished.
       */
      showResponsive: function() {
        return this.each(function() {
          var $this = $(this);
          
          // Ensure that the element this is being executed on must be a table!
          _checkElement.call(this, true);
          var data = $this.data('responsiveTable');

          $this.hide();
          data.responsive.show();
        });
      }
    }
    
    //
    // PRIVATE FUNCTIONS
    //
    
    /**
     * Checks the general preconditions for elements that this Plugin is being
     * executed on.
     *
     * It is expected that this is the table being check.
     * 
     * @throws Exception if the given DOM element is not a table.
     * @throws Exception if a helper method is directly called on a not yet initialized
     *             table.
     */
    function _checkElement(checkProcessed) {
      if (checkProcessed === undefined) {
        checkProcessed = true;
      }
      
      var $this = $(this);
      if (!$this.is('table')) {
        throw 'The selected DOM element may only be a table!';
      }    
      
      if (checkProcessed) {
        var data = $this.data('responsiveTable')
        if ( data === undefined ) {
          throw 'The selected DOM element has to be initialized by webks-responsive-table first.';
        }
      }
      
      return $this;
    };
    
    /**
     * Extract information from table to build responsive table.
     * It is expected that this is the table
     */
    function _buildResponsiveTable(settings, result) {
      var $this = $(this)

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
      
      return result;
    }
        
    
    // Method calling logic
    if ( methods[method] ) {
      return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else if ( typeof method === 'object' || ! method ) {
      return methods.init.apply( this, arguments );
    } else {
      $.error( 'Method ' +  method + ' does not exist on jQuery.tooltip' );
    }    
    
  };
})(jQuery);
