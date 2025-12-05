import { useCallback, useEffect, useRef, useState } from "react";
import { Modal, Button, Spinner } from "react-bootstrap";
import {
  checkOrderStatus,
  isPaymentCompleted,
  isPaymentCanceled,
} from "../../services/paymentService";
import "./MoMoPaymentModal.css";

const POLLING_INTERVAL = 4000; // 4 seconds
const MAX_POLLING_TIME = 10 * 60 * 1000; // 10 minutes max

const MoMoPaymentModal = ({
  show,
  onHide,
  payUrl,
  orderId,
  onPaymentSuccess,
  onPaymentFailed,
}) => {
  const [status, setStatus] = useState("waiting"); // waiting, success, failed, timeout
  const [message, setMessage] = useState("");
  const [hasRedirected, setHasRedirected] = useState(false);
  const pollingRef = useRef(null);
  const startTimeRef = useRef(null);
  const abortControllerRef = useRef(null);
  const paymentWindowRef = useRef(null);

  // Open payment URL in new tab/window
  const openPaymentPage = useCallback(() => {
    if (payUrl && !hasRedirected) {
      paymentWindowRef.current = window.open(payUrl, "_blank", "noopener");
      setHasRedirected(true);
    }
  }, [payUrl, hasRedirected]);

  // Start polling for payment status
  const startPolling = useCallback(() => {
    if (!orderId) return;

    startTimeRef.current = Date.now();

    const poll = async () => {
      // Check if max polling time exceeded
      if (Date.now() - startTimeRef.current > MAX_POLLING_TIME) {
        setStatus("timeout");
        setMessage("Hết thời gian chờ thanh toán. Vui lòng thử lại.");
        stopPolling();
        return;
      }

      try {
        // Create new abort controller for each request
        abortControllerRef.current = new AbortController();

        const order = await checkOrderStatus(orderId, {
          signal: abortControllerRef.current.signal,
        });

        console.log("Polling order status:", order);

        if (isPaymentCompleted(order)) {
          setStatus("success");
          setMessage("Thanh toán thành công!");
          stopPolling();
          // Close payment window if still open
          if (paymentWindowRef.current && !paymentWindowRef.current.closed) {
            paymentWindowRef.current.close();
          }
          setTimeout(() => {
            onPaymentSuccess?.(order);
          }, 1500);
          return;
        }

        if (isPaymentCanceled(order)) {
          setStatus("failed");
          setMessage("Đơn hàng đã bị hủy.");
          stopPolling();
          onPaymentFailed?.("canceled");
          return;
        }

        // Continue polling
        pollingRef.current = setTimeout(poll, POLLING_INTERVAL);
      } catch (error) {
        if (error.name === "AbortError") {
          console.log("Polling aborted");
          return;
        }
        console.error("Polling error:", error);
        // Continue polling even on error
        pollingRef.current = setTimeout(poll, POLLING_INTERVAL);
      }
    };

    // Start first poll
    pollingRef.current = setTimeout(poll, POLLING_INTERVAL);
  }, [orderId, onPaymentSuccess, onPaymentFailed]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearTimeout(pollingRef.current);
      pollingRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // Start polling and open payment page when modal opens
  useEffect(() => {
    if (show && payUrl && orderId) {
      setStatus("waiting");
      setMessage("");
      setHasRedirected(false);
      startPolling();
      // Auto open payment page after a short delay
      const timer = setTimeout(() => {
        openPaymentPage();
      }, 500);
      return () => clearTimeout(timer);
    }

    return () => {
      stopPolling();
    };
  }, [show, payUrl, orderId, startPolling, stopPolling, openPaymentPage]);

  // Handle modal close
  const handleClose = () => {
    stopPolling();
    if (status === "waiting") {
      // User closed without completing payment
      onPaymentFailed?.("closed");
    }
    onHide();
  };

  // Handle manual open payment page
  const handleOpenPaymentPage = () => {
    if (payUrl) {
      paymentWindowRef.current = window.open(payUrl, "_blank", "noopener");
    }
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      size="md"
      centered
      backdrop="static"
      className="momo-payment-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>
          <img
            src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png"
            alt="MoMo"
            className="momo-logo"
          />
          Thanh toán qua MoMo
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {status === "waiting" && (
          <div className="momo-waiting-screen">
            <div className="momo-qr-icon">
              <i className="bi bi-qr-code-scan"></i>
            </div>

            <h5>Đang chờ thanh toán...</h5>

            <p className="text-muted mb-4">
              Trang thanh toán MoMo đã được mở trong tab mới.
              <br />
              Vui lòng quét mã QR và hoàn tất thanh toán.
            </p>

            <div className="momo-waiting-spinner">
              <Spinner animation="border" variant="danger" />
            </div>

            <div className="momo-tips">
              <h6>Hướng dẫn:</h6>
              <ol>
                <li>Mở ứng dụng MoMo trên điện thoại</li>
                <li>Quét mã QR trên trang thanh toán</li>
                <li>Xác nhận thanh toán trong ứng dụng</li>
                <li>Quay lại đây và chờ xác nhận</li>
              </ol>
            </div>

            <Button
              variant="outline-danger"
              className="mt-3"
              onClick={handleOpenPaymentPage}
            >
              <i className="bi bi-arrow-up-right-square me-2"></i>
              Mở lại trang thanh toán
            </Button>
          </div>
        )}

        {status === "success" && (
          <div className="momo-status success">
            <i className="bi bi-check-circle-fill"></i>
            <h4>Thanh toán thành công!</h4>
            <p>Đơn hàng của bạn đã được xác nhận.</p>
            <p className="text-muted">Đang chuyển hướng...</p>
          </div>
        )}

        {status === "failed" && (
          <div className="momo-status failed">
            <i className="bi bi-x-circle-fill"></i>
            <h4>Thanh toán thất bại</h4>
            <p>{message || "Đã có lỗi xảy ra. Vui lòng thử lại."}</p>
          </div>
        )}

        {status === "timeout" && (
          <div className="momo-status timeout">
            <i className="bi bi-clock-fill"></i>
            <h4>Hết thời gian</h4>
            <p>{message}</p>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        {status === "waiting" && (
          <Button variant="secondary" onClick={handleClose}>
            Hủy thanh toán
          </Button>
        )}

        {(status === "failed" || status === "timeout") && (
          <Button variant="primary" onClick={handleClose}>
            Đóng
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default MoMoPaymentModal;
