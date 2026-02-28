I want to create an MVP application for merchants in retail organizations to help them negotiate MAP (Minimum Advertised Price) policies and values from suppliers.  

This app will allow a merchant to enter an item's UPC, MAP price, and the vendor's MAP policy (a .doc or .pdf) which was provided by the vendor/supplier.  They can either bulk upload the price and UPC OR enter them in individually.  

Once the MAP price, UPC and policy are uploaded, the app will assess the whether the MAP value should be discussed with the vendor.  It should be discussed if the MAP value, if treated as a floor price, will prohibit the retailer from being able to price competitively.  This should be done through scraping competitive websites for the item and determining if the MAP value is higher than the market price. I'd like to focus on Amazon and Walmart as competitors for this MVP.  

The app should also review the policy (using AI) and determine if the policy is:

- applicable to all retailers, not just a specific segment  or channel.  For example, if the policy is only applicable to "big box retailers", this should be called out.
- Has specific consequences and steps that will be taken if the policy is violated.  It can not be general - it must have specific action steps when a MAP policy is broken.  Example: first violation is a warning, second violation is a cut off of supply for 90 days, third violation is suspension of the relationship.

The app should be able to determine if they vendor is actually enforcing their policy as it will be able to assess the market price against MAP values.  If the market (Amazon and Walmart) are at or above MAP values, then this indicates that they may be enforcing.  

The app should provide the merchant with next steps - either go back to the vendor to discuss their policy OR proceed. 

The app should be elegant and simple.  The output should be similar to LLM chatbots.