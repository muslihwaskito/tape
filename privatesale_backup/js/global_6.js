function getCookie(name) {
    var v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
    return v ? v[2] : null;
}

function getCookieValue(name) { // i.e., name is key
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

function stripHtml(html) {

    // Create a new div element
    var temporalDivElement = document.createElement("div");
    // Set the HTML content with the providen
    temporalDivElement.innerHTML = html;
    // Retrieve the text property of the element (cross-browser support)
    return temporalDivElement.textContent || temporalDivElement.innerText || "";

}

// Get n occurences of substring from a string
function occurrences(string, subString, allowOverlapping) {

    string += "";
    subString += "";
    if (subString.length <= 0) return (string.length + 1);

    var n = 0,
        pos = 0,
        step = allowOverlapping ? 1 : subString.length;

    while (true) {
        pos = string.indexOf(subString, pos);
        if (pos >= 0) {
            ++n;
            pos += step;
        } else break;
    }
    return n;
}

function getUrlParameter(Param) {
    var sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('&'),
        ParameterName,
        i;
    
    for (i = 0; i < sURLVariables.length; i++) {
        ParameterName = sURLVariables[i].split('=');
    
        if (ParameterName[0] === Param) {
            return ParameterName[1] === undefined ? true : decodeURIComponent(ParameterName[1]);
        }
    }
}

function plan_level(plan, type, website_plan, payment_platform)
{
    // Stripe
    if( payment_platform == 1)
    {
        // Free
        if(plan == 'free')
        {
            if(website_plan == 1)
            {
                return true;
            }
        }
        // Pro
        else if(plan == 'pro')
        {
            if(type == 'equal_or_more')
            {
                if(website_plan >= 2)
                {
                    return true;
                }
            }
            else if(type == 'equal_or_less')
            {
                if(	website_plan == 2
                    || website_plan == 4
                    || website_plan == 1)
                {
                    return true;
                }
            }
            if(type == 'equal')
            {
                if(	website_plan == 2
                    || website_plan == 4)
                {
                    return true;
                }
            }
        }
        // Business
        else if(plan == 'business')
        {
            if(type == 'equal_or_more')
            {
                if(	website_plan == 6
                    || website_plan == 3
                    || website_plan == 5
                    || website_plan == 7
                    || website_plan == 8)
                {
                    return true;
                }
            }
            else if(type == 'equal_or_less')
            {
                if(	website_plan == 6
                    || website_plan == 2
                    || website_plan == 4
                    || website_plan == 1)
                {
                    return true;
                }
            }
            if(type == 'equal')
            {
                if(website_plan == 6)
                {
                    return true;
                }
            }
        }
        // Premium
        else if(plan == 'premium')
        {
            if(type == 'equal_or_more')
            {
                if(	website_plan == 3
                    || website_plan == 5
                    || website_plan == 7
                    || website_plan == 8)
                {
                    return true;
                }
            }
            else if(type == 'equal_or_less')
            {
                if(	website_plan == 3
                    || website_plan == 5
                    || website_plan == 6
                    || website_plan == 2
                    || website_plan == 4
                    || website_plan == 1)
                {
                    return true;
                }
            }
            if(type == 'equal')
            {
                if(	website_plan == 3
                    || website_plan == 5)
                {
                    return true;
                }
            }
        }
        // Enterprise
        else if(plan == 'enterprise')
        {
            if(type == 'equal_or_more')
            {
                if(	website_plan == 7
                    || website_plan == 8)
                {
                    return true;
                }
            }
            else if(type == 'equal_or_less')
            {
                if(website_plan <= 8)
                {
                    return true;
                }
            }
            if(type == 'equal')
            {
                if(	website_plan == 7
                    || website_plan == 8)
                {
                    return true;
                }
            }
        }
        // No conditions are met, return false
        return false;
    }
    // Braintree / Shopify / Chargebee
    else if(payment_platform == 2
            || payment_platform == 3
            || payment_platform == 4)
    {
        // Free
        if(plan == 'free')
        {
            if(website_plan == 1)
            {
                return true;
            }
        }
        // Pro
        else if(plan == 'pro')
        {
            if(type == 'equal_or_more')
            {
                if(website_plan >= 2)
                {
                    return true;
                }
            }
            else if(type == 'equal_or_less')
            {
                if(	website_plan <= 4)
                {
                    return true;
                }
            }
            if(type == 'equal')
            {
                if(	website_plan == 2
                    || website_plan == 3
                    || website_plan == 4)
                {
                    return true;
                }
            }
        }
        // Business
        else if(plan == 'business')
        {
            if(type == 'equal_or_more')
            {
                if(	website_plan >= 5)
                {
                    return true;
                }
            }
            else if(type == 'equal_or_less')
            {
                if(	website_plan <= 7)
                {
                    return true;
                }
            }
            if(type == 'equal')
            {
                if( website_plan == 5
                    || website_plan == 6
                    || website_plan == 7)
                {
                    return true;
                }
            }
        }
        // Premium
        else if(plan == 'premium')
        {
            if(type == 'equal_or_more')
            {
                if(	website_plan >= 8)
                {
                    return true;
                }
            }
            else if(type == 'equal_or_less')
            {
                if(	website_plan <= 10)
                {
                    return true;
                }
            }
            if(type == 'equal')
            {
                if(	website_plan == 8
                    || website_plan == 9
                    || website_plan == 10)
                {
                    return true;
                }
            }
        }
        // Enterprise
        else if(plan == 'enterprise')
        {
            if(type == 'equal_or_more')
            {
                if(	website_plan >= 11)
                {
                    return true;
                }
            }
            else if(type == 'equal_or_less')
            {
                if(website_plan <= 11)
                {
                    return true;
                }
            }
            if(type == 'equal')
            {
                if(	website_plan == 11
                    || website_plan == 12
                    || website_plan == 13)
                {
                    return true;
                }
            }
        }
        // No conditions are met, return false
        return false;
    }
}

function if_payment_system(payment_platform)
{
    // Stripe
    if(payment_platform == 1)
    {
        return 'stripe';
    }
    // Braintree
    else if(payment_platform == 2)
    {
        return 'braintree';
    }
    // Shopify
    else if(payment_platform == 3)
    {
        return 'shopify';
    }
    // Charge Bee
    else if(payment_platform == 4)
    {
        return 'chargebee';
    }
}

// Show response
function show_response(success, response, if_margin_top)
{
    $('#braintree_response_wrapper').html(response);

    // Success
    if(success == 1)
    {
        $('#braintree_response_wrapper').css('background', '#28a745');
    }
    // Error
    else
    {
        $('#braintree_response_wrapper').css('background', '#dc3545');
    }

    if(if_margin_top == true)
    {
        $('#braintree_response_wrapper').css('top', '20px');
    }

    $("#braintree_response_wrapper").fadeIn(function() {
        setTimeout(function()
        {
            $("#braintree_response_wrapper").fadeOut();
        }, 5000);
    });
}

// Form field min length requirements
function value_length_requirement(id)
{
    switch(id)
    {
        case 'payment_name':
        return 1;
        break;

        case 'payment_card_number':
        return 16;
        break;
        
        case 'payment_expiration_date':
        return 5;
        break;
        
        case 'payment_security_code':
        return 3;
        break;
        
    }
}

// Form validator
function validator( payment_name,
                    payment_card_number,
                    payment_expiration_date,
                    payment_security_code,
                    id,
                    value)
{
    // Validate single field on blur, keyup
    if(id !== '')
    {
        // payment name
        if( value == ''
            || value.length < value_length_requirement(id))
        {
            $('#' + id).css('border-bottom', '1px solid red');
            $('#' + id + '_header').css('color', 'red');
            errors = 1;
        }
        else
        {
            $('#' + id).css('border-bottom', '1px solid #dcdcdc');
            $('#' + id + '_header').css('color', '#555');
        }
    }
    // Validate all fields on submit
    else
    {
        // Set errors to "0"
        var errors = 0;

        // payment name
        if(payment_name == '')
        {
            $('#payment_name').css('border-bottom', '1px solid red');
            $('#payment_name_header').css('color', 'red');
            errors = 1;
        }
        else
        {
            $('#payment_name').css('border-bottom', '1px solid #dcdcdc');
            $('#payment_name_header').css('color', '#555');
        }
        
        // Card number
        if( payment_card_number == ''
            || payment_card_number.length < value_length_requirement('payment_card_number'))
        {
            $('#payment_card_number').css('border-bottom', '1px solid red');
            $('#payment_card_number_header').css('color', 'red');
            errors = 1;
        }
        else
        {
            $('#payment_card_number').css('border-bottom', '1px solid #dcdcdc');
            $('#payment_card_number_header').css('color', '#555');
        }
        
        // Expiration date
        if( payment_expiration_date == ''
            || payment_expiration_date.length < value_length_requirement('payment_expiration_date'))
        {
            $('#payment_expiration_date').css('border-bottom', '1px solid red');
            $('#payment_expiration_date_header').css('color', 'red');
            errors = 1;
        }
        else
        {
            $('#payment_expiration_date').css('border-bottom', '1px solid #dcdcdc');
            $('#payment_expiration_date_header').css('color', '#555');
        }
        
        // Security code
        if( payment_security_code == ''
            || payment_security_code.length < value_length_requirement('payment_security_code'))
        {
            $('#payment_security_code').css('border-bottom', '1px solid red');
            $('#payment_security_code_header').css('color', 'red');
            errors = 1;
        }
        else
        {
            $('#payment_security_code').css('border-bottom', '1px solid #dcdcdc');
            $('#payment_security_code_header').css('color', '#555');
        }

        return errors;
    }
}

// Unlock paid features
function unlock_features(website_plan, payment_platform) {
    
    // Pro and up
    if (plan_level('pro', 'equal_or_more', website_plan, payment_platform) == true) {

        var array = ['entry_methods_box_holder_one', 'entry_methods_box_holder_two'];
        
        var arrayLength = array.length;

        for (var i = 0; i < arrayLength; i++) {

            var a = array[i];
            var css_selector = '';

            // Pro
            if(plan_level('pro', 'equal', website_plan, payment_platform) == true)
            {
                css_selector = '#' + a + ' .pro_plan_wrapper';
            }
            // Business
            else if(plan_level('business', 'equal', website_plan, payment_platform) == true)
            {
                css_selector = '#' + a + ' .pro_plan_wrapper, #' + a + ' .business_plan_wrapper';
            }
            // Premium
            else if(plan_level('premium', 'equal', website_plan, payment_platform) == true)
            {
                css_selector = '#' + a + ' .pro_plan_wrapper, #' + a + ' .business_plan_wrapper, #' + a + ' .premium_plan_wrapper';
            }
            // Enterprise
            else if(plan_level('enterprise', 'equal', website_plan, payment_platform) == true)
            {
                css_selector = '#' + a + ' .pro_plan_wrapper, #' + a + ' .business_plan_wrapper, #' + a + ' .premium_plan_wrapper #' + a + ' .enterprise_plan_wrapper';
            }

            $( css_selector ).each(function() {
                
                var data_type 		= $( this ).attr("data-type");
                var data_level 		= $( this ).attr("data-level");
                var data_value 		= $( this ).attr("data-value");
                var data_id 		= $( this ).attr("data-id");
                var data_classes 	= $( this ).attr("data-classes");
                
                $( '#' + a + ' #' + data_id ).remove();
                
                $( '#' + a + ' #' + data_id + '_wrapper' ).html('<button type="button" data-level="' + data_level + '" id="' + data_id + '" class="entry_method_add ' + data_classes + ' entry_method_add_style" data-entry-method="' + data_id + '"><label>' + data_value + '</label></button>');

            });

        }
        
        // Pro and up
        if(plan_level('pro', 'equal_or_more', website_plan, payment_platform) == true)
        {	
            $('.entry_method_add_disallow_pro').prop('disabled', false).removeClass('entry_method_add_disallow_pro');

            $('input[name=integrations_submit]').prop('disabled', false);
                
            // Remove pro tooltips
            $('.pro_plan_tool_tip').remove();

            $('.entry_method_field_pro').css('display', 'block');

            $('.pro_lock_icon_wrapper').hide();

            // HACK - this is because the .payment_holder would still slide down after removing .entry_method_add_disallow_*
            $('.payment_holder').remove();

            // Remove pro tooltips text
            $('.available_in_pro_plan_text').remove();
            
            // Prize image
            $('#prize_image').attr('type', 'file');
            $('input[name=image_display]').prop("disabled", false);
            $('input[name=remove_image]').prop("disabled", false);
            
            // Background image
            $('#background_image_loc').attr('type', 'file');
            
            // Landing page background color
            $('input[name=landing_page_background_type]').prop("disabled", false);
            
            // Youtube video feature input
            
            // Image or video radio buttons
            $('input[name=image_or_video]').prop("disabled", false);

            // Default confirmation email radio button
            $('#user_email_send_default').prop("disabled", false);
            
            // Hide all entries count
            $('#hide_all_entries_wrapper').html('<label style="margin:0;padding:0;color:#444;cursor:pointer;float:left;" id="hide_all_entries_label" class="entry_method_add"><input name="hide_all_entries" type="checkbox" value="1"> Hide "All Entries" Count</label>');
            
            // Icon color spectrum
            $('.icon_color_spectrum').removeClass('icon_color_disallow');
            
            // Enable checkboxes with disabled class
            $('.checkbox_pro_enable_disable_class').prop('disabled', false);

            // Pro input fields with disabled="1"
            $('.entry_input_pro, .entry_checkbox_pro').prop('disabled', false);
            
            // Update hidden website_plan field in build_edit_widget.inc.php
            $('#user_website_plan').val(website_plan);

            // End user trial demo
            $('#user_trial_demo').val('0');

            // Update hidden website_plan field in build_edit_widget.inc.php
            $('#user_website_plan').val(website_plan).trigger('change');

            $('.integrations_text_input').prop('disabled', false);
        }
        
        // Business and up
        if(plan_level('business', 'equal_or_more', website_plan, payment_platform) == true)
        {
            $('.entry_method_add_disallow_business').prop('disabled', false).removeClass('entry_method_add_disallow_business');

            $('select[name=entries_or_points]').prop('disabled', false);

            // Remove business tooltips
            $('.business_plan_tool_tip').remove();

            $('.business_lock_icon_wrapper').hide();

            // Remove business tooltips text
            $('.available_in_business_plan_text').remove();

            // Business input fields with disabled="1"
            $('.entry_input_business, .entry_checkbox_business').prop('disabled', false);

            // Enable if_leaderboard and if_unlock_rewards
            $('input[name=if_leaderboard], input[name=if_unlock_rewards], input[name=require_verify_email]').prop('disabled', false);

            // Update hidden website_plan field in build_edit_widget.inc.php
            $('#user_website_plan').val(website_plan);

            // End user trial demo
            $('#user_trial_demo').val('0');

            // Update hidden website_plan field in build_edit_widget.inc.php
            $('#user_website_plan').val(website_plan).trigger('change');
            
        }

        // Premium and up
        if(plan_level('premium', 'equal_or_more', website_plan, payment_platform) == true)
        {
            $('.entry_method_add_disallow_premium').prop('disabled', false).removeClass('entry_method_add_disallow_premium');

            // Remove premium tooltips
            $('.pro_plan_tool_tip').remove();

            $('.premium_lock_icon_wrapper').hide();

            // Remove premium tooltips text
            $('.available_in_premium_plan_text').remove();
            
            // Make it so the allowed countries textarea is not disabled
            $('.myAutocomplete_textarea').prop('disabled', false).css('background', '#fff');
            
            // re-write allowed countries checkbox
            $('#allowed_world_wide_checkbox_wrapper').html('<input type="checkbox" name="allowed_world_wide" value="1" checked="checked" onclick="allowed_worldwide_checkbox_click();">');
            
            // Hide allowed countries button
            $('#countries_allowed_add_wrapper').hide();
            
            // Show allowed countries textarea
            $('#countries_allowed_wrapper').show();

            // Custom logo
            $('#custom_logo_image_loc').attr('type', 'file');

            // Custom confirmation email radio button
            $('#user_email_send_custom').prop("disabled", false);
            
            // re-write white labeling checkbox label wrapper
            $('#white_labeling_wrapper').html('<label style="margin:0;padding:0;color:#444;cursor:pointer;float:left;" id="remove_footer_label" class="entry_method_add"><input name="remove_footer" type="checkbox" value="1"> White labeling</label>');
            
            // Update hidden website_plan field in build_edit_widget.inc.php
            $('#user_website_plan').val(website_plan);

            // End user trial demo
            $('#user_trial_demo').val('0');

            $('#user_website_plan').val(website_plan).trigger('change');
            
            $('.unlock_rewards_if_send_email').prop('disabled', false);
        }
            
        // Enterprise
        if(plan_level('enterprise', 'equal_or_more', website_plan, payment_platform) == true)
        {
            $('.entry_method_add_disallow_enterprise').prop('disabled', false).removeClass('entry_method_add_disallow_enterprise');

            $('input[name=if_enter_whitelist]').prop('disabled', false);

            // Remove enterprise tooltips
            $('.enterprise_plan_tool_tip').remove();

            $('.enterprise_lock_icon_wrapper').hide();

            // Remove enterprise tooltips text
            $('.available_in_enterprise_plan_text').remove();
            
            // security_2fa radio button
            $('input[name=security_2fa]').prop("disabled", false);

            // Custom HTML confirmation email radio button
            $('input[name=security_2fa]').prop("disabled", false);

            // Custom HTML confirmation email radio button
            $('#user_email_body_if_custom_html').prop("disabled", false);

            // enterprise input fields with disabled="1"
            $('.entry_input_enterprise, .entry_checkbox_enterprise, input[name=if_accept_payments]').prop('disabled', false);
        }

    }
    
}

function pricing_plan_int_to_text(plan_id)
{
    plan_id = parseInt(plan_id);
    switch(plan_id)
    {
        case 1:
        return 'Free';
        break;

        case 2:
        return 'Pro';
        break;

        case 3:
        return 'Pro';
        break;

        case 4:
        return 'Pro';
        break;

        case 5:
        return 'Business';
        break;

        case 6:
        return 'Business';
        break;

        case 7:
        return 'Business';
        break;

        case 8:
        return 'Premium';
        break;

        case 9:
        return 'Premium';
        break;

        case 10:
        return 'Premium';
        break;

        case 11:
        return 'Enterprise';
        break;

        case 12:
        return 'Enterprise';
        break;

        case 13:
        return 'Enterprise';
        break;
    }
}

function pricing_plan(plan_id, price, type)
{
    // Monthly
    if(type == 'monthly')
    {
        var month_year = 'month';
    }
    // Annually
    else if(type == 'annual')
    {
        var month_year = 'year';
    }
    
    var response =
    '<div style="width:100%; margin:0 0 10px 0; float:left;">Selected: <strong>' + pricing_plan_int_to_text(plan_id) + ' Plan</strong></div>' +
    '<div style="width:100%; margin:0 0 10px 0; float:left;">$' + price + ' per ' + month_year + '</div>';

    $('#payment_message_wrapper_2').html(response);
}

function coupon_code_braintree_update_price(website_url, plan_id, coupon_code_braintree, plan_billing_cycle_option, payment_platform)
{
    $.ajax({
        type: 'POST',
        url: website_url + '/a/coupon_code_update_grand_total.php',
        data:   {
                plan_id:plan_id,
                coupon_code_braintree:coupon_code_braintree,
                plan_billing_cycle_option:plan_billing_cycle_option,
                payment_platform:payment_platform
                },
        success: function (result)
        {
            $('#payment_message_wrapper_2').html(result);
        }
    });
}

function parse_signup_plan(getUrlParameter_plan, getUrlParameter_cycle)
{
    if(getUrlParameter_cycle == 'monthly')
    {
        switch(getUrlParameter_plan)
        {
            case 'pro':
            var plan_id = 2;
            break;

            case 'business':
            var plan_id = 5;
            break;

            case 'premium':
            var plan_id = 8;
            break;

            case 'enterprise':
            var plan_id = 11;
            break;
        }
    }
    else if(getUrlParameter_cycle == 'annual')
    {
        switch(getUrlParameter_plan)
        {
            case 'pro':
            var plan_id = 3;
            break;

            case 'business':
            var plan_id = 6;
            break;

            case 'premium':
            var plan_id = 9;
            break;

            case 'enterprise':
            var plan_id = 12;
            break;
        }
    }
    return plan_id;
}

function payment_plan_open(website_url, id_clicked, plan_id, plan_billing_cycle_option, coupon_code_braintree, payment_platform)
{
    coupon_code_braintree = coupon_code_braintree.replace(/\-/g, '_');
    if(id_clicked !== '')
    {
        if(plan_billing_cycle_option == 'monthly')
            {
            switch(id_clicked)
            {
                case 'payment_button_free':
                var plan_id = 1;
                var price = 0;
                break;

                case 'payment_button_pro':
                var plan_id = 2;
                var price = 29;
                break;

                case 'payment_button_business':
                var plan_id = 5;
                var price = 49;
                break;

                case 'payment_button_premium':
                var plan_id = 8;
                var price = 99;
                break;

                case 'payment_button_enterprise':
                var plan_id = 11;
                var price = 199;
                break;
            }
        }
        else if(plan_billing_cycle_option == 'annual')
        {
            switch(id_clicked)
            {
                case 'payment_button_free':
                var plan_id = 1;
                var price = 0;
                break;

                case 'payment_button_pro':
                var plan_id = 3;
                var price = 299;
                break;

                case 'payment_button_business':
                var plan_id = 6;
                var price = 499;
                break;

                case 'payment_button_premium':
                var plan_id = 9;
                var price = 999;
                break;
                
                case 'payment_button_enterprise':
                var plan_id = 12;
                var price = 1999;
                break;
            }
        }
    }
    
    $("#pricing_plan option:selected").removeAttr("selected");
    $('#pricing_plan option[value=' + plan_id + ']').attr('selected','selected');
    $('.nice_payment_wrapper select').niceSelect('update');
    $('#background_opaque_overlay, #braintree_form_wrapper').show();
    
    if(typeof price === 'undefined')
    {
    var price = $('.nice_payment_wrapper select').find(':selected').attr('data-price');
    }
    
    if(typeof plan_billing_cycle_option === 'undefined')
    {
    var type = $('.nice_payment_wrapper select').find(':selected').attr('data-type');
    }
    
    pricing_plan(plan_id, price, plan_billing_cycle_option);
    
    $('html,body').scrollTop(0);

    if(coupon_code_braintree !== '' && typeof coupon_code_braintree !== 'undefined')
    {
        // Update price if user already has used a coupon code
        $('#coupon_code_braintree_link').click();
        $('#coupon_code_braintree').val(coupon_code_braintree);
        var plan_billing_cycle_option = $('input[name="plan_billing_cycle_option"]:checked').val();
        
        coupon_code_braintree_update_price(website_url, plan_id, coupon_code_braintree, plan_billing_cycle_option, payment_platform);
    }
}