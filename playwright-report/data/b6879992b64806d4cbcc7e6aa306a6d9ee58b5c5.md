# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e9]:
    - img "Logo" [ref=e10]
    - generic [ref=e11]:
      - generic [ref=e12]: Login
      - generic [ref=e13]: Please login to continue to your account.
    - generic [ref=e14]:
      - generic [ref=e15]:
        - generic [ref=e17]: Email*
        - generic [ref=e18]:
          - textbox "Email*" [ref=e19]:
            - /placeholder: Enter Email
            - text: superadmin@example.com
          - generic [ref=e21]: 
      - generic [ref=e22]:
        - generic [ref=e24]: Password*
        - generic [ref=e25]:
          - textbox "Password*" [ref=e26]:
            - /placeholder: Enter Password
            - text: "123456"
          - img "eye-invisible" [ref=e28] [cursor=pointer]:
            - img [ref=e29]
      - generic [ref=e33] [cursor=pointer]: Forgot Password?
      - button "Login" [active] [ref=e35] [cursor=pointer]:
        - generic [ref=e36]: Login
  - generic [ref=e38]:
    - alert [ref=e40]:
      - generic [ref=e43]: Invalid username/password.
    - generic "Close" [ref=e44] [cursor=pointer]:
      - img "close" [ref=e45]:
        - img [ref=e46]
```