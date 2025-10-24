package org.firstinspires.ftc.teamcode;

import com.qualcomm.robotcore.eventloop.opmode.LinearOpMode;
import com.qualcomm.robotcore.eventloop.opmode.TeleOp;
import com.qualcomm.robotcore.hardware.DcMotor;

@TeleOp(name = "panamatest (Blocks to Java)")
public class panamatest extends LinearOpMode {

  private DcMotor left_motor;
  private DcMotor right_arm;
  private DcMotor Lift;
  private DcMotor left_arm;
  private DcMotor right_motor;

  /**
   * This sample contains the bare minimum Blocks for any regular OpMode. The 3 blue
   * Comment Blocks show where to place Initialization code (runs once, after touching the
   * DS INIT button, and before touching the DS Start arrow), Run code (runs once, after
   * touching Start), and Loop code (runs repeatedly while the OpMode is active, namely not
   * Stopped).
   */
  @Override
  public void runOpMode() {
    boolean UpButton;
    boolean DownButton;

    left_motor = hardwareMap.get(DcMotor.class, "left_motor");
    right_arm = hardwareMap.get(DcMotor.class, "right_arm");
    Lift = hardwareMap.get(DcMotor.class, "Lift");
    left_arm = hardwareMap.get(DcMotor.class, "left_arm");
    right_motor = hardwareMap.get(DcMotor.class, "right_motor");

    // Put initialization blocks here.
    left_motor.setDirection(DcMotor.Direction.REVERSE);
    right_arm.setDirection(DcMotor.Direction.REVERSE);
    Lift.setZeroPowerBehavior(DcMotor.ZeroPowerBehavior.BRAKE);
    left_arm.setMode(DcMotor.RunMode.STOP_AND_RESET_ENCODER);
    right_arm.setMode(DcMotor.RunMode.STOP_AND_RESET_ENCODER);
    waitForStart();
    if (opModeIsActive()) {
      // Put run blocks here.
      while (opModeIsActive()) {
        // Put loop blocks here.
        UpButton = gamepad2.dpad_up;
        DownButton = gamepad2.dpad_down;
        left_motor.setPower(gamepad1.left_stick_y);
        right_motor.setPower(gamepad1.right_stick_y);
        if (UpButton) {
          left_arm.setTargetPosition(-150);
          right_arm.setTargetPosition(-150);
          left_arm.setMode(DcMotor.RunMode.RUN_TO_POSITION);
          right_arm.setMode(DcMotor.RunMode.RUN_TO_POSITION);
          left_arm.setPower(0.5);
          right_arm.setPower(0.5);
        } else if (DownButton) {
          left_arm.setTargetPosition(0);
          right_arm.setTargetPosition(0);
          left_arm.setMode(DcMotor.RunMode.RUN_TO_POSITION);
          right_arm.setMode(DcMotor.RunMode.RUN_TO_POSITION);
          Lift.setPower(0.5);
          left_arm.setPower(0.5);
        }
        telemetry.addData("Left_Motor", left_motor.getPower());
        telemetry.addData("Right_Motor", right_motor.getPower());
        telemetry.addData("Left_Arm_Position", left_arm.getCurrentPosition());
        telemetry.addData("Right_Arm_Position", Math.abs(right_arm.getCurrentPosition()));
        telemetry.update();
      }
    }
  }
}
