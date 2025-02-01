;; Define NFT token
(define-non-fungible-token lattice-nft uint)

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-invalid-params (err u101))
(define-constant err-nft-exists (err u102))
(define-constant err-not-owner (err u103))

;; Data structures
(define-map lattice-data
  uint
  {
    pattern-type: (string-ascii 20),
    points: (list 100 {x: uint, y: uint}),
    connections: (list 200 {from: uint, to: uint}),
    name: (string-ascii 50),
    description: (string-ascii 500),
    attributes: (list 20 {trait: (string-ascii 20), value: (string-ascii 20)})
  }
)

;; Token ID counter
(define-data-var last-token-id uint u0)

;; Mint new lattice NFT
(define-public (mint-lattice 
  (pattern-type (string-ascii 20))
  (points (list 100 {x: uint, y: uint}))
  (connections (list 200 {from: uint, to: uint}))
  (name (string-ascii 50))
  (description (string-ascii 500))
  (attributes (list 20 {trait: (string-ascii 20), value: (string-ascii 20)}))
)
  (let
    (
      (token-id (+ (var-get last-token-id) u1))
    )
    (asserts! (is-valid-pattern points connections) (err err-invalid-params))
    (try! (nft-mint? lattice-nft token-id tx-sender))
    (map-set lattice-data token-id
      {
        pattern-type: pattern-type,
        points: points,
        connections: connections,
        name: name,
        description: description,
        attributes: attributes
      }
    )
    (var-set last-token-id token-id)
    (ok token-id)
  )
)

;; Transfer NFT
(define-public (transfer (token-id uint) (sender principal) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender sender) (err err-not-owner))
    (nft-transfer? lattice-nft token-id sender recipient)
  )
)

;; Read-only functions
(define-read-only (get-lattice-data (token-id uint))
  (ok (map-get? lattice-data token-id))
)

(define-read-only (get-token-owner (token-id uint))
  (ok (nft-get-owner? lattice-nft token-id))
)

(define-private (is-valid-pattern (points (list 100 {x: uint, y: uint})) (connections (list 200 {from: uint, to: uint})))
  (and
    (> (len points) u0)
    (> (len connections) u0)
    true
  )
)
