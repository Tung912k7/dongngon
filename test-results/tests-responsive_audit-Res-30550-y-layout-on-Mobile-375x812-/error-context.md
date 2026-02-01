# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - banner [ref=e2]:
    - generic [ref=e4]:
      - button "Mở menu" [ref=e5]:
        - img [ref=e6]
      - generic [ref=e8]:
        - generic:
          - img
        - textbox [ref=e9]
  - main [ref=e12]:
    - generic [ref=e15]:
      - heading "ĐỒNG NGÔN" [level=1] [ref=e17]
      - img "Đồng Ngôn Logo" [ref=e20]
      - paragraph [ref=e21]: Một tâm hồn, nhiều ngòi bút.
  - contentinfo [ref=e22]:
    - generic [ref=e23]:
      - button "Đồng ngôn Logo" [ref=e25]:
        - img "Đồng ngôn Logo" [ref=e26]
      - generic [ref=e27]: © 2026 Đồng ngôn bởi tôi và bạn trai
      - navigation [ref=e28]:
        - link "Góp ý" [ref=e29] [cursor=pointer]:
          - /url: https://forms.gle/2ENzFe3rdUhkXTP59
        - button "Giải cứu admin" [ref=e30]
  - button "Open Next.js Dev Tools" [ref=e36] [cursor=pointer]:
    - img [ref=e37]
  - alert [ref=e40]
```